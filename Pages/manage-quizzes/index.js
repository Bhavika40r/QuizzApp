
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    axios.get('/api/quizzes')
      .then(response => {
        setQuizzes(response.data);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
      });
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Manage Quizzes</h1>
      <Link href="/manage-quizzes/create">
        <a className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-block mb-4">Create New Quiz</a>
      </Link>
      <ul>
        {quizzes.map(quiz => (
          <li key={quiz.id} className="mb-2">
            {quiz.title} - Score: {quiz.totalScore}, Duration: {quiz.duration} minutes
            <Link href={`/manage-quizzes/edit/${quiz.id}`}>
              <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded ml-2">Edit</a>
            </Link>
            <Link href={`/manage-quizzes/questions/${quiz.id}`}>
              <a className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded ml-2">Manage Questions</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
