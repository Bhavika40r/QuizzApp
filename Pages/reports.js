
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    axios.get('/api/reports')
      .then(response => {
        setQuizzes(response.data);
      })
      .catch(error => {
        console.error('Error fetching reports:', error);
      });
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Reports</h1>
      {quizzes.map(quiz => (
        <div key={quiz.id}>
          <h2>{quiz.title}</h2>
          {/* Display quiz details */}
          {/* Display participant details */}
          {/* Display individual responses */}
        </div>
      ))}
    </div>
  );
};

export default Reports;
