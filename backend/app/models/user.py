from sqlalchemy import Boolean, Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    quizzes = relationship("Quiz", back_populates="creator")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    tokens = relationship("UserToken", back_populates="user")
    rate_limit = relationship("RateLimit", uselist=False, back_populates="user")


class UserToken(Base):
    __tablename__ = "user_tokens"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(512), unique=True, nullable=False)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="tokens")


class RateLimit(Base):
    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    request_count = Column(Integer, default=0)
    last_reset_time = Column(DateTime, default=func.now())

    # Relationships
    user = relationship("User", back_populates="rate_limit")