from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserToken
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.security.jwt import verify_password, get_password_hash, create_access_token, get_current_user
from datetime import datetime

router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=UserSchema)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user_username = db.query(User).filter(User.username == user.username).first()
    if db_user_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user_email = db.query(User).filter(User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create new user
    db_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Validate user credentials
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token, expires_at = create_access_token(user.id, user.is_admin)
    
    # Store token in database
    db_token = UserToken(
        user_id=user.id,
        token=access_token,
        expires_at=expires_at
    )
    
    db.add(db_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expires_at,
        "user": user
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Invalidate all user's tokens
    tokens = db.query(UserToken).filter(
        UserToken.user_id == current_user.id,
        UserToken.is_active == True
    ).all()
    
    for token in tokens:
        token.is_active = False
    
    db.commit()
    
    return {"detail": "Successfully logged out"}