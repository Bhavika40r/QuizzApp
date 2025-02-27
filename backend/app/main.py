from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, admin, user
from app.config import settings
from app.security.rate_limiter import rate_limiter

# Create tables in the database
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Online Quiz System",
    description="A FastAPI-based online quiz system with user authentication and quiz management",
    version="1.0.0"
)

# CORS middleware for frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_PREFIX}",
)

app.include_router(
    admin.router,
    prefix=f"{settings.API_V1_PREFIX}/admin",
    dependencies=[Depends(rate_limiter)]
)

app.include_router(
    user.router,
    prefix=f"{settings.API_V1_PREFIX}/user",
    dependencies=[Depends(rate_limiter)]
)

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to the Online Quiz System API",
        "documentation": "/docs",
        "version": "1.0.0"
    }