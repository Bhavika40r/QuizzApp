# Online Quiz System

## Project Overview

A basic online quiz system with user authentication and quiz management. Admins create quizzes, and users can take them and view scores.

## Technologies Used

*   **Backend:** Python (FastAPI)
*   **Frontend:** Next.js
*   **Database:** MySQL/PostgreSQL
*   **Authentication:** JWT

## Setup

1.  Clone: `git clone [repo URL]`
2.  Frontend:
    *   `cd [project dir]`
    *   `npm install` or `yarn install`
    *   Create `.env.local` with `DATABASE_URL` and `JWT_SECRET`
    *   `npm run dev` or `yarn dev`
3.  Backend:
    *   `cd onlinequiz_backend`
    *   `python3 -m venv venv`
    *   `source venv/bin/activate` (Linux/macOS) or `venv\Scripts\activate` (Windows)
    *   `pip install -r requirements.txt` (Create a requirements.txt file)
    *   `uvicorn main:app --reload`
4.  Database: Import `database/schema.sql`

## API Endpoints

*   `POST /login`: User login (returns JWT cookie)
*   `GET /quizzes`: (Admin) Get quiz list
*   `POST /quizzes`: (Admin) Create quiz
*   `POST /quizzes/{id}/questions`: (Admin) Map questions
*   `GET /my-quizzes`: (User) Get quizzes with status
*   `POST /quizzes/{id}/start`: (User) Start quiz
*   `POST /quizzes/{id}/submit`: (User) Submit quiz
*   `GET /quizzes/{id}/response`: (User) Get quiz response



