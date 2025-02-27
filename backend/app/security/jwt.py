from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.config import settings
from app.database import get_db
from app.models.user import User, UserToken
from app.schemas.user import TokenPayload

# Password hashing utilities
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token extraction from request
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/login")

# Verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Hash password
def get_password_hash(password):
    return pwd_context.hash(password)

# Create access token
def create_access_token(user_id: int, is_admin: bool):
    # Set token expiration time
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)
    
    # Create JWT payload
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "is_admin": is_admin
    }
    
    # Encode using JWT
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return encoded_jwt, expire

# Get current user from token
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = int(payload.get("sub"))
        
        # Check token expiration time
        token_expiry = datetime.fromtimestamp(payload.get("exp"))
        if datetime.utcnow() >= token_expiry:
            raise credentials_exception
        
        # Check if token exists in database and is active
        db_token = db.query(UserToken).filter(
            UserToken.token == token,
            UserToken.is_active == True
        ).first()
        
        if not db_token:
            raise credentials_exception
        
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise credentials_exception
            
        return user
        
    except JWTError:
        raise credentials_exception

# Get current admin user
async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user