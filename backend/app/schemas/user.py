from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# Properties to return via API
class User(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        orm_mode = True

# Properties for user login
class UserLogin(BaseModel):
    username: str
    password: str

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: User

# Token data for JWT payload
class TokenPayload(BaseModel):
    sub: int  # user ID
    exp: datetime
    is_admin: bool