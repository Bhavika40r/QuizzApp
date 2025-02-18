


// pages/manage-quizzes/create.js
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const QuizCreate = () => {
  const [title, setTitle] = useState('');
  const [noOfQuestions, setNoOfQuestions] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [duration, setDuration] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/quizzes', {
        title,
        noOfQuestions,
        totalScore,
        duration,
      });
      router.push('/manage-quizzes'); // Redirect to the list of quizzes
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Create New Quiz</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input type="text" id="title" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label htmlFor="noOfQuestions" className="block text-gray-700 text-sm font-bold mb-2">Number of Questions:</label>
          <input type="number" id="noOfQuestions" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={noOfQuestions} onChange={(e) => setNoOfQuestions(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label htmlFor="totalScore" className="block text-gray-700 text-sm font-bold mb-2">Total Score:</label>
          <input type="number" id="totalScore" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={totalScore} onChange={(e) => setTotalScore(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label htmlFor="duration" className="block text-gray-700 text-sm font-bold mb-2">Duration (minutes):</label>
          <input type="number" id="duration" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={duration} onChange={(e) => setDuration(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Create Quiz</button>
      </form>
    </div>
  );
};

export default QuizCreate;
