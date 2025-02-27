-- Users Table (for both regular users and admins)
CREATE TABLE users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store hashed passwords
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Questions Table (already provided in requirements)
CREATE TABLE questions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    question TEXT NOT NULL,
    PRIMARY KEY (id)
);

-- Question Options Table (already provided in requirements)
CREATE TABLE question_options (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    question_id INT UNSIGNED NOT NULL,
    option TEXT NOT NULL,
    is_correct TINYINT UNSIGNED DEFAULT '0',
    PRIMARY KEY (id),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Quizzes Table
CREATE TABLE quizzes (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    num_questions INT UNSIGNED NOT NULL,
    total_score INT UNSIGNED NOT NULL,
    duration_minutes INT UNSIGNED NOT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Quiz Questions Mapping
CREATE TABLE quiz_questions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    quiz_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    question_number INT UNSIGNED NOT NULL,
    marks INT UNSIGNED NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_quiz_question (quiz_id, question_id),
    UNIQUE KEY unique_quiz_question_number (quiz_id, question_number)
);

-- User Quiz Attempts
CREATE TABLE quiz_attempts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    quiz_id INT UNSIGNED NOT NULL,
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL DEFAULT NULL,
    score INT UNSIGNED DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_quiz_attempt (user_id, quiz_id, status) -- Ensures only one in-progress attempt per quiz per user
);

-- User Quiz Responses
CREATE TABLE quiz_responses (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    attempt_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    selected_option_id INT UNSIGNED,
    is_correct BOOLEAN DEFAULT FALSE,
    marks_obtained INT UNSIGNED DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES question_options(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attempt_question (attempt_id, question_id)
);

-- API Rate Limiting Table
CREATE TABLE rate_limits (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    request_count INT UNSIGNED DEFAULT 0,
    last_reset_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_rate_limit (user_id)
);

-- User Sessions / Tokens
CREATE TABLE user_tokens (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(512) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token)
);

-- Indexes for better query performance
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_responses_attempt_id ON quiz_responses(attempt_id);
CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX idx_rate_limits_user_id ON rate_limits(user_id);