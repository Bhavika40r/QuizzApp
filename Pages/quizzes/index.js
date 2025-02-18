
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const QuizListing = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // Fetch quizzes with user-specific status
    axios.get('/api/my-quizzes')
      .then(response => {
        setQuizzes(response.data);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
      });
  }, []);

  const getButton = (quiz) => {
    if (quiz.status === 'Not Started') {
      return (
        <Link href={`/quizzes/${quiz.id}`}>
          <a className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Start</a>
        </Link>
      );
    } else if (quiz.status === 'In Progress') {
      return (
        <Link href={`/quizzes/${quiz.id}`}>
          <a className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Resume</a>
        </Link>
      );
    } else if (quiz.status === 'Completed') {
      return (
        <Link href={`/quizzes/result/${quiz.id}`}>
          <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">View Score</a>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Available Quizzes</h1>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id} className="mb-4 p-4 border rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                <p>Status: {quiz.status}</p>
              </div>
              {getButton(quiz)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizListing;
