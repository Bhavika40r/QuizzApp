from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question = Column(Text, nullable=False)

    # Relationships
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    quiz_questions = relationship("QuizQuestion", back_populates="question")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    option = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)

    # Relationships
    question = relationship("Question", back_populates="options")
    responses = relationship("QuizResponse", back_populates="selected_option")