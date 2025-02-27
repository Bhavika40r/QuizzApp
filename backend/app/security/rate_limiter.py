from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, RateLimit
from app.security.jwt import get_current_user
from app.config import settings
from datetime import datetime, timedelta
import time
from functools import wraps
import redis

# Redis client for rate limiting (if available)
redis_client = None
if settings.REDIS_URL:
    try:
        redis_client = redis.from_url(settings.REDIS_URL)
    except:
        redis_client = None

# Rate limiting middleware using Redis (more scalable approach)
async def redis_rate_limiter(request: Request, user: User = Depends(get_current_user)):
    if not redis_client:
        return
    
    # Create a key for the user
    key = f"rate_limit:{user.id}"
    
    # Get the current count and time window
    current = redis_client.get(key)
    
    if current is None:
        # First request in the time window
        redis_client.set(key, 1, ex=1)  # Expire in 1 second
    else:
        # Increment the counter
        current_count = int(current)
        if current_count >= settings.RATE_LIMIT_PER_SECOND:
            # Too many requests
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
                headers={"Retry-After": "1"}
            )
        redis_client.incr(key)

# Rate limiting using database (fallback if Redis is not available)
async def db_rate_limiter(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get or create rate limit record for user
    rate_limit = db.query(RateLimit).filter(RateLimit.user_id == user.id).first()
    
    if not rate_limit:
        rate_limit = RateLimit(user_id=user.id)
        db.add(rate_limit)
        db.commit()
        db.refresh(rate_limit)
    
    current_time = datetime.utcnow()
    
    # Check if need to reset counter (new second)
    if (current_time - rate_limit.last_reset_time).total_seconds() >= 1:
        rate_limit.request_count = 1
        rate_limit.last_reset_time = current_time
    else:
        # Check if limit exceeded
        if rate_limit.request_count >= settings.RATE_LIMIT_PER_SECOND:
            # Too many requests
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded",
                headers={"Retry-After": "1"}
            )
        # Increment counter
        rate_limit.request_count += 1
    
    db.commit()

# Rate limiter dependency that chooses the appropriate implementation
async def rate_limiter(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if redis_client:
        await redis_rate_limiter(request, user)
    else:
        await db_rate_limiter(request, user, db)