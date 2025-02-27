class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    marks = Column(Integer, nullable=False)

    # Constraints
    __table_args__ = (
        UniqueConstraint('quiz_id', 'question_id', name='unique_quiz_question'),
        UniqueConstraint('quiz_id', 'question_number', name='unique_quiz_question_number'),
    )

    # Relationships
    quiz = relationship("Quiz", back_populates="quiz_questions")
    question = relationship("Question", back_populates="quiz_questions")