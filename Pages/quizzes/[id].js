
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const QuizAttempt = () => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(0);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      // Fetch quiz details including questions
      axios.get(`/api/quizzes/${id}`)
        .then(response => {
          setQuiz(response.data);
          setTimer(response.data.duration * 60); // in seconds
        })
        .catch(error => {
          console.error('Error fetching quiz:', error);
        });
    }
  }, [id]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      // Automatically submit quiz
      handleSubmit();
    }
  }, [timer]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedOption(null);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
    setSelectedOption(null);
  };

  const handleSubmit = async () => {
    try {
      // Submit quiz responses
      await axios.post(`/api/quizzes/${id}/submit`, {
        responses: [], // Array of user responses
      });
      router.push(`/quizzes/result/${id}`); // Redirect to the result page
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (!quiz) {
    return <div className="container mx-auto">Loading...</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">{quiz.title}</h1>
      <p>Time Remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}</p>
      <div className="p-4 border rounded shadow">
        <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1}:</h2>
        <p>{currentQuestion.question}</p>
        <ul className="mt-4">
          {currentQuestion.options.map(option => (
            <li key={option.id} className="mb-2">
              <button
                onClick={() => handleOptionSelect(option)}
                className={`p-2 rounded ${selectedOption === option ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {option.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex justify-between">
        {currentQuestionIndex > 0 && (
          <button onClick={handlePrevious} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Previous</button>
        )}
        {currentQuestionIndex < quiz.questions.length - 1 ? (
          <button onClick={handleNext} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Next</button>
        ) : (
          <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Submit</button>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;
