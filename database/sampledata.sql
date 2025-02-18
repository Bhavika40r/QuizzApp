-- Sample Data for questions table
INSERT INTO questions (id, question) VALUES
(1, 'Which of the following is a NoSQL database?'),
(2, 'What does CSS stand for?'),
(3, 'In Java, which keyword is used to create a subclass?'),
(4, 'What does REST stand for in REST API?'),
(5, 'Which of the following sorting algorithms has the best average-case time complexity?'),
(6, 'Which command is used to check active ports on a Linux system?'),
(7, 'In JavaScript, which of the following is used to declare a constant variable?'),
(8, 'Which HTTP status code indicates that the request was successful but no content is returned?'),
(9, 'In SQL, which clause is used to filter results after an aggregation function is applied?'),
(10, 'What is the primary advantage of using Docker containers?');

-- Sample Data for question_options table
INSERT INTO question_options (question_id, `option`, is_correct) VALUES
(1, 'MySQL', 0),
(1, 'PostgreSQL', 0),
(1, 'MongoDB', 1),
(1, 'SQLite', 0),
(2, 'Computer Style Sheets', 0),
(2, 'Creative Style Sheets', 0),
(2, 'Cascading Style Sheets', 1),
(2, 'Colorful Style Sheets', 0),
(3, 'extends', 1),
(3, 'implements', 0),
(3, 'inherits', 0),
(3, 'super', 0),
(4, 'Representational State Transfer', 1),
(4, 'Remote Execution and State Transfer', 0),
(4, 'Rapid Enterprise System Technology', 0),
(4, 'Recursive State Transition', 0),
(5, 'Bubble Sort', 0),
(5, 'Merge Sort', 1),
(5, 'Selection Sort', 0),
(5, 'Insertion Sort', 0),
(6, 'netstat -tulnp', 1),
(6, 'ps aux', 0),
(6, 'top', 0),
(6, 'htop', 0),
(7, 'var', 0),
(7, 'let', 0),
(7, 'const', 1),
(7, 'final', 0),
(8, '200', 0),
(8, '201', 0),
(8, '204', 1),
(8, '404', 0),
(9, 'WHERE', 0),
(9, 'HAVING', 1),
(9, 'GROUP BY', 0),
(9, 'ORDER BY', 0),
(10, 'They allow running multiple OS instances on a single machine', 0),
(10, 'They improve CPU performance', 0),
(10, 'They provide consistent environments across different systems', 1),
(10, 'They increase RAM efficiency', 0);

-- Sample Data for users table (Make sure to hash passwords before inserting)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@example.com', '$2b$10$hashed_pass', 'admin'), 
('user1', 'user1@example.com', '$2b$10$hashed_pass', 'user');   

-- Sample Data for quizzes table
INSERT INTO quizzes (title, description, total_score, duration, created_by) VALUES
('Sample Quiz 1', 'A basic sample quiz', 10, 15, 1); -- created_by is the admin user ID

-- Sample Data for quiz_attempts table
INSERT INTO quiz_attempts (user_id, quiz_id, status, score) VALUES
(2, 1, 'Completed', 8); -- user_id is the regular user ID, quiz_id is the quiz ID
