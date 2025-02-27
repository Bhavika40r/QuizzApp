from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class AttemptStatus(enum.Enum):
    in_progress = "in_progress"
    completed = "completed"

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    status = Column(Enum(AttemptStatus), default=AttemptStatus.in_progress)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime, nullable=True)
    score = Column(Integer, default=0)

    # Constraints - Only one in-progress attempt per user per quiz
    __table_args__ = (
        UniqueConstraint('user_id', 'quiz_id', 'status', name='unique_user_quiz_attempt'),
    )

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="quiz_attempts")
    responses = relationship("QuizResponse", back_populates="attempt", cascade="all, delete-orphan")


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("question_options.id"), nullable=True)
    is_correct = Column(Boolean, default=False)
    marks_obtained = Column(Integer, default=0)

    # Constraints - Only one response per question per attempt
    __table_args__ = (
        UniqueConstraint('attempt_id', 'question_id', name='unique_attempt_question'),
    )

    # Relationships
    attempt = relationship("QuizAttempt", back_populates="responses")
    question = relationship("Question")
    selected_option = relationship("QuestionOption", back_populates="responses")