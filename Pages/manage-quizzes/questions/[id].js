
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      axios.get(`/api/quizzes/${id}/questions`)
        .then(response => {
          setQuestions(response.data);
        })
        .catch(error => {
          console.error('Error fetching questions:', error);
        });
    }
  }, [id]);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Manage Questions for Quiz {id}</h1>
      <ul>
        {questions.map(question => (
          <li key={question.id} className="mb-2">
            {question.question}
            {/* Display options and marks */}
          </li>
        ))}
      </ul>
      {/* Form to add new questions */}
    </div>
  );
};

export default QuestionManagement;
