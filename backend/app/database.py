from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Database URL
DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for SQLAlchemy models
Base = declarative_base()

# Dependency for database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()