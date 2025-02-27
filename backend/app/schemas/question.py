from pydantic import BaseModel
from typing import List, Optional, Dict

# Question Option Schemas
class QuestionOptionBase(BaseModel):
    option: str
    is_correct: bool = False

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOption(QuestionOptionBase):
    id: int
    question_id: int

    class Config:
        orm_mode = True

# Question Schemas
class QuestionBase(BaseModel):
    question: str

class QuestionCreate(QuestionBase):
    options: List[QuestionOptionCreate]

class Question(QuestionBase):
    id: int
    options: List[QuestionOption]

    class Config:
        orm_mode = True

# Quiz Question Mapping Schemas
class QuizQuestionBase(BaseModel):
    question_id: int
    question_number: int
    marks: int

class QuizQuestionCreate(QuizQuestionBase):
    pass

class QuizQuestion(QuizQuestionBase):
    id: int
    quiz_id: int

    class Config:
        orm_mode = True

class QuizQuestionDetail(QuizQuestion):
    question: Question

    class Config:
        orm_mode = True