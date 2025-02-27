from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion
from app.models.question import Question, QuestionOption
from app.models.attempt import QuizAttempt, QuizResponse, AttemptStatus
from app.schemas.quiz import Quiz as QuizSchema
from app.schemas.attempt import QuizAttempt as QuizAttemptSchema, QuizAttemptCreate, QuizSubmit, QuizResponseDetail
from app.security.jwt import get_current_user
from app.security.rate_limiter import rate_limiter

router = APIRouter(tags=["User"], dependencies=[Depends(rate_limiter)])

# Get all available quizzes for the user
@router.get("/my-quizzes", response_model=List[dict])
def get_user_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all quizzes
    quizzes = db.query(Quiz).all()
    
    # Get user attempts for these quizzes
    quiz_attempts = {}
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    
    for attempt in attempts:
        if attempt.quiz_id not in quiz_attempts or attempt.id > quiz_attempts[attempt.quiz_id].id:
            quiz_attempts[attempt.quiz_id] = attempt
    
    # Prepare response with quiz status
    user_quizzes = []
    for quiz in quizzes:
        quiz_data = {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "total_score": quiz.total_score,
            "duration_minutes": quiz.duration_minutes,
            "status": "Not Started"
        }
        
        if quiz.id in quiz_attempts:
            attempt = quiz_attempts[quiz.id]
            if attempt.status == AttemptStatus.completed:
                quiz_data["status"] = "Completed"
                quiz_data["score"] = attempt.score
            else:
                quiz_data["status"] = "In Progress"
                quiz_data["attempt_id"] = attempt.id
        
        user_quizzes.append(quiz_data)
    
    return user_quizzes

# Start a quiz
@router.post("/quizzes/{quiz_id}/start", response_model=QuizAttemptSchema)
def start_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if user already has an in-progress attempt
    existing_attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.status == AttemptStatus.in_progress
    ).first()
    
    if existing_attempt:
        return existing_attempt
    
    # Create new attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        status=AttemptStatus.in_progress
    )
    
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Initialize empty responses for all questions
    quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    
    responses = []
    for qq in quiz_questions:
        response = QuizResponse(
            attempt_id=attempt.id,
            question_id=qq.question_id
        )
        responses.append(response)
    
    db.add_all(responses)
    db.commit()
    
    return attempt

# Get quiz questions for the current user's attempt
@router.get("/quizzes/{quiz_id}/questions")
def get_quiz_questions(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get or create user attempt
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.status == AttemptStatus.in_progress
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=400,
            detail="You need to start the quiz first"
        )
    
    # Get quiz questions with options
    questions = []
    quiz_questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    
    for qq in quiz_questions:
        # Get question details
        question = db.query(Question).filter(Question.id == qq.question_id).first()
        
        # Get options
        options = db.query(QuestionOption).filter(QuestionOption.question_id == question.id).all()
        
        # Get user's response if any
        response = db.query(QuizResponse).filter(
            QuizResponse.attempt_id == attempt.id,
            QuizResponse.question_id == question.id
        ).first()
        
        questions.append({
            "question_number": qq.question_number,
            "marks": qq.marks,
            "id": question.id,
            "question": question.question,
            "options": [{"id": opt.id, "option": opt.option} for opt in options],
            "selected_option_id": response.selected_option_id if response else None
        })
    
    # Sort questions by question number
    questions.sort(key=lambda q: q["question_number"])
    
    return {
        "quiz_id": quiz_id,
        "title": quiz.title,
        "duration_minutes": quiz.duration_minutes,
        "total_score": quiz.total_score,
        "attempt_id": attempt.id,
        "start_time": attempt.start_time,
        "questions": questions
    }

# Submit quiz response
@router.post("/quizzes/{quiz_id}/submit")
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get user's attempt
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.status == AttemptStatus.in_progress
    ).first()
    
    if not attempt:
        raise HTTPException(
            status_code=400,
            detail="No active attempt found for this quiz"
        )
    
    # Process each response
    total_score = 0
    
    for response_data in submission.responses:
        # Find the corresponding response record
        response = db.query(QuizResponse).filter(
            QuizResponse.attempt_id == attempt.id,
            QuizResponse.question_id == response_data.question_id
        ).first()
        
        if not response:
            # Create if it doesn't exist
            response = QuizResponse(
                attempt_id=attempt.id,
                question_id=response_data.question_id
            )
            db.add(response)
            db.flush()
        
        # Update response with user's answer
        response.selected_option_id = response_data.selected_option_id
        
        # Check if the answer is correct
        if response.selected_option_id:
            selected_option = db.query(QuestionOption).filter(
                QuestionOption.id == response.selected_option_id
            ).first()
            
            if selected_option and selected_option.is_correct:
                response.is_correct = True
                
                # Find the marks for this question
                question_mapping = db.query(QuizQuestion).filter(
                    QuizQuestion.quiz_id == quiz_id,
                    QuizQuestion.question_id == response_data.question_id
                ).first()
                
                if question_mapping:
                    response.marks_obtained = question_mapping.marks
                    total_score += question_mapping.marks
    
    # Update attempt status and score
    attempt.status = AttemptStatus.completed
    attempt.end_time = datetime.utcnow()
    attempt.score = total_score
    
    db.commit()
    
    return {
        "quiz_id": quiz_id,
        "attempt_id": attempt.id,
        "total_possible_score": quiz.total_score,
        "score_obtained": total_score,
        "completed": True
    }

# Get quiz response for a completed quiz
@router.get("/quizzes/{quiz_id}/response")
def get_quiz_response(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get user's completed attempt
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.status == AttemptStatus.completed
    ).order_by(QuizAttempt.id.desc()).first()
    
    if not attempt:
        raise HTTPException(
            status_code=400,
            detail="No completed attempt found for this quiz"
        )
    
    # Get all responses
    responses = db.query(QuizResponse).filter(
        QuizResponse.attempt_id == attempt.id
    ).all()
    
    # Prepare detailed response data
    questions_data = []
    for response in responses:
        # Get question details
        question = db.query(Question).filter(Question.id == response.question_id).first()
        
        # Get question mapping for marks
        question_mapping = db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz_id,
            QuizQuestion.question_id == response.question_id
        ).first()
        
        # Get all options
        options = db.query(QuestionOption).filter(
            QuestionOption.question_id == response.question_id
        ).all()
        
        # Get selected option
        selected_option = None
        if response.selected_option_id:
            selected_option = db.query(QuestionOption).filter(
                QuestionOption.id == response.selected_option_id
            ).first()
        
        # Get correct option
        correct_option = db.query(QuestionOption).filter(
            QuestionOption.question_id == response.question_id,
            QuestionOption.is_correct == True
        ).first()
        
        questions_data.append({
            "question_number": question_mapping.question_number if question_mapping else 0,
            "question_id": question.id,
            "question_text": question.question,
            "marks_possible": question_mapping.marks if question_mapping else 0,
            "marks_obtained": response.marks_obtained,
            "is_correct": response.is_correct,
            "selected_option": {
                "id": selected_option.id,
                "option": selected_option.option
            } if selected_option else None,
            "correct_option": {
                "id": correct_option.id,
                "option": correct_option.option
            } if correct_option else None,
            "all_options": [{"id": opt.id, "option": opt.option} for opt in options]
        })
    
    # Sort by question number
    questions_data.sort(key=lambda q: q["question_number"])
    
    return {
        "quiz_id": quiz_id,
        "quiz_title": quiz.title,
        "total_score": quiz.total_score,
        "user_score": attempt.score,
        "completion_time": attempt.end_time,
        "questions": questions_data
    }