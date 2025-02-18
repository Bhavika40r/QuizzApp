// pages/index.js
import React from 'react';

const HomePage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to the Online Quiz System</h1>
      <p className="mb-4">Please log in to take quizzes or manage quizzes (admin).</p>
      <div className="flex justify-center">
        <a href="/user-login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
          User Login
        </a>
        <a href="/admin-login" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Admin Login
        </a>
      </div>
    </div>
  );
};

export default HomePage;
