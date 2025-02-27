from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.quiz import Quiz, QuizQuestion
from app.models.question import Question, QuestionOption
from app.models.attempt import QuizAttempt, QuizResponse, AttemptStatus
from app.schemas.quiz import Quiz as QuizSchema, QuizCreate, QuizDetail, QuizQuestionsRequest
from app.schemas.question import Question as QuestionSchema, QuestionCreate
from app.schemas.user import User as UserSchema
from app.schemas.attempt import QuizAttempt as QuizAttemptSchema, QuizResponseDetail
from app.security.jwt import get_current_admin
from app.security.rate_limiter import rate_limiter

router = APIRouter(tags=["Admin"], dependencies=[Depends(rate_limiter)])

# Get all quizzes
@router.get("/quizzes", response_model=List[QuizSchema])
def get_quizzes(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    quizzes = db.query(Quiz).all()
    return quizzes

# Get quiz by ID
@router.get("/quizzes/{quiz_id}", response_model=QuizDetail)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

# Create a new quiz
@router.post("/quizzes", response_model=QuizSchema)
def create_quiz(
    quiz: QuizCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    db_quiz = Quiz(
        title=quiz.title,
        description=quiz.description,
        num_questions=quiz.num_questions,
        total_score=quiz.total_score,
        duration_minutes=quiz.duration_minutes,
        created_by=current_admin.id
    )
    
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    return db_quiz

# Map questions to a quiz
@router.post("/quizzes/{quiz_id}/questions", response_model=QuizDetail)
def map_questions_to_quiz(
    quiz_id: int,
    questions_request: QuizQuestionsRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if the number of questions matches the quiz configuration
    if len(questions_request.questions) != quiz.num_questions:
        raise HTTPException(
            status_code=400,
            detail=f"Number of questions must match quiz configuration (expected {quiz.num_questions})"
        )
    
    # Check if all questions exist
    question_ids = [q.question_id for q in questions_request.questions]
    existing_questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    
    if len(existing_questions) != len(question_ids):
        raise HTTPException(status_code=404, detail="One or more questions not found")
    
    # Clear existing question mappings
    db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).delete()
    
    # Create new question mappings
    total_marks = 0
    quiz_questions = []
    
    for q in questions_request.questions:
        quiz_question = QuizQuestion(
            quiz_id=quiz_id,
            question_id=q.question_id,
            question_number=q.question_number,
            marks=q.marks
        )
        total_marks += q.marks
        quiz_questions.append(quiz_question)
    
    # Validate total marks match quiz configuration
    if total_marks != quiz.total_score:
        raise HTTPException(
            status_code=400,
            detail=f"Total marks must match quiz configuration (expected {quiz.total_score}, got {total_marks})"
        )
    
    db.add_all(quiz_questions)
    db.commit()
    
    # Refresh quiz to get updated relationships
    db.refresh(quiz)
    return quiz

# Get all questions
@router.get("/questions", response_model=List[QuestionSchema])
def get_questions(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    questions = db.query(Question).all()
    return questions

# Create a new question
@router.post("/questions", response_model=QuestionSchema)
def create_question(
    question: QuestionCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    # Create question
    db_question = Question(question=question.question)
    db.add(db_question)
    db.flush()  # Flush to get the ID
    
    # Create options
    has_correct_option = False
    db_options = []
    
    for option in question.options:
        db_option = QuestionOption(
            question_id=db_question.id,
            option=option.option,
            is_correct=option.is_correct
        )
        if option.is_correct:
            has_correct_option = True
        db_options.append(db_option)
    
    # Validate at least one correct option
    if not has_correct_option:
        db.rollback()
        raise HTTPException(status_code=400, detail="Question must have at least one correct option")
    
    db.add_all(db_options)
    db.commit()
    db.refresh(db_question)
    
    return db_question

# Get quiz participants
@router.get("/quizzes/{quiz_id}/participants", response_model=List[QuizAttemptSchema])
def get_quiz_participants(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get all attempts for this quiz
    attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == quiz_id).all()
    
    return attempts

# Get participant's quiz responses
@router.get("/quizzes/{quiz_id}/responses/{user_id}", response_model=List[QuizResponseDetail])
def get_participant_responses(
    quiz_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    # Check if quiz exists
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's latest attempt for this quiz
    attempt = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.user_id == user_id
    ).order_by(QuizAttempt.id.desc()).first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="No attempt found")
    
    # Get responses for this attempt
    responses = db.query(QuizResponse).filter(QuizResponse.attempt_id == attempt.id).all()
    
    # Prepare detailed response data
    detailed_responses = []
    for response in responses:
        question = db.query(Question).filter(Question.id == response.question_id).first()
        selected_option = None
        if response.selected_option_id:
            selected_option = db.query(QuestionOption).filter(
                QuestionOption.id == response.selected_option_id
            ).first()
        
        correct_option = db.query(QuestionOption).filter(
            QuestionOption.question_id == response.question_id,
            QuestionOption.is_correct == True
        ).first()
        
        detailed_response = {
            "id": response.id,
            "attempt_id": response.attempt_id,
            "question_id": response.question_id,
            "selected_option_id": response.selected_option_id,
            "is_correct": response.is_correct,
            "marks_obtained": response.marks_obtained,
            "question": {
                "id": question.id,
                "question": question.question
            },
            "selected_option": {
                "id": selected_option.id,
                "option": selected_option.option
            } if selected_option else None,
            "correct_option": {
                "id": correct_option.id,
                "option": correct_option.option
            } if correct_option else None
        }
        
        detailed_responses.append(detailed_response)
    
    return detailed_responses