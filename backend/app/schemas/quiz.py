from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .question import QuizQuestionCreate, QuizQuestionDetail, Question, QuestionOption

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    num_questions: int
    total_score: int
    duration_minutes: int

class QuizCreate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    created_by: int
    created_at: datetime

    class Config:
        orm_mode = True

class QuizDetail(Quiz):
    questions: List[QuizQuestionDetail] = []

    class Config:
        orm_mode = True

# Quiz Questions Mapping Request
class QuizQuestionsRequest(BaseModel):
    questions: List[QuizQuestionCreate]