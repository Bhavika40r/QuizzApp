
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const QuizResult = () => {
  const [result, setResult] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
    
      axios.get(`/api/quizzes/${id}/response`)
        .then(response => {
          setResult(response.data);
        })
        .catch(error => {
          console.error('Error fetching quiz result:', error);
        });
    }
  }, [id]);

  if (!result) {
    return <div className="container mx-auto">Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">{result.quizTitle}</h1>
      <p>Total Marks: {result.totalMarks}</p>
      <p>User Marks: {result.userMarks}</p>
      <h2 className="text-xl font-semibold mt-4">Questions and Responses:</h2>
      <ul>
        {result.questions.map(question => (
          <li key={question.id} className="mb-4 p-4 border rounded shadow">
            <p>{question.text}</p>
            <p>Chosen Option: {question.chosenOption}</p>
            <p>Correct Option: {question.correctOption}</p>
            <p>Marks: {question.marks}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizResult;
