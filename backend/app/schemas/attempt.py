from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class AttemptStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"

# Quiz Response Schemas
class QuizResponseBase(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None

class QuizResponseCreate(QuizResponseBase):
    pass

class QuizResponse(QuizResponseBase):
    id: int
    attempt_id: int
    is_correct: bool
    marks_obtained: int

    class Config:
        orm_mode = True

class QuizResponseDetail(QuizResponse):
    question: Dict[str, Any]
    selected_option: Optional[Dict[str, Any]]
    correct_option: Dict[str, Any]

    class Config:
        orm_mode = True

# Quiz Attempt Schemas
class QuizAttemptBase(BaseModel):
    quiz_id: int

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttempt(QuizAttemptBase):
    id: int
    user_id: int
    status: AttemptStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    score: int = 0

    class Config:
        orm_mode = True

class QuizAttemptDetail(QuizAttempt):
    quiz: Dict[str, Any]
    responses: List[QuizResponseDetail] = []

    class Config:
        orm_mode = True

# Quiz Submit Schema
class QuizSubmit(BaseModel):
    responses: List[QuizResponseCreate]