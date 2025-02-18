-- Users table (for both admins and regular users)
CREATE TABLE users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- Store hashed passwords
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);

-- Tokens table (for managing JWT tokens and their expiry)
CREATE TABLE tokens (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,  -- Store the JWT token
    expiry_at TIMESTAMP NOT NULL,   -- Token expiry timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Rate Limits table (for tracking API request counts)
CREATE TABLE rate_limits (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INT UNSIGNED NOT NULL DEFAULT 0,
    last_request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Quizzes table (for storing quiz information)
CREATE TABLE quizzes (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_score INT UNSIGNED NOT NULL,
    duration INT UNSIGNED NOT NULL,  -- Duration in minutes
    created_by INT UNSIGNED NOT NULL,  -- User ID of the admin who created the quiz
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Questions table (for storing quiz questions)
CREATE TABLE questions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    quiz_id INT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    question_number INT UNSIGNED NOT NULL,
    marks INT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Question Options table (for storing options for each question)
CREATE TABLE question_options (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    question_id INT UNSIGNED NOT NULL,
    option_text TEXT NOT NULL,
    is_correct TINYINT UNSIGNED DEFAULT '0',  -- 1 if correct, 0 if incorrect
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Quiz Attempts table (for tracking user attempts on quizzes)
CREATE TABLE quiz_attempts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    quiz_id INT UNSIGNED NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    score INT UNSIGNED NULL,
    status ENUM('Not Started', 'In Progress', 'Completed') NOT NULL DEFAULT 'Not Started',
    PRIMARY KEY (`id`),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Quiz Responses table (for storing user responses to each question)
CREATE TABLE quiz_responses (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    attempt_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    chosen_option_id INT UNSIGNED NULL,  -- ID of the option chosen by the user
    is_correct TINYINT UNSIGNED NULL,   -- 1 if correct, 0 if incorrect
    marks_awarded INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (chosen_option_id) REFERENCES question_options(id)
);
