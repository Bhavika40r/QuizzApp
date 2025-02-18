// pages/dashboard.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { parseCookies, destroyCookie } from 'nookies';

const Dashboard = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const cookies = parseCookies();
        const token = cookies.jwt;

        if (!token) {
          router.push('/admin-login'); 
          return;
        }

        const response = await axios.get('/api/user', { // Create a new /api/user endpoint
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        if (response.status === 200) {
          setUsername(response.data.username);
          setUserRole(response.data.role);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        setError('Authentication failed');
        destroyCookie(null, 'jwt'); // Clear the cookie
        router.push('/admin-login'); // Redirect to login
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout'); // Call the /api/logout endpoint to clear the cookie
      destroyCookie(null, 'jwt');
      router.push('/admin-login'); // Redirect to login
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl">Welcome, {username}</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
          Logout
        </button>
      </div>

      {userRole === 'admin' ? (
        <div>
          <h2 className="text-xl mt-4">Admin Dashboard</h2>
          <button onClick={() => router.push('/manage-quizzes')}>Manage Quizzes</button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl mt-4">User Dashboard</h2>
          <button onClick={() => router.push('/quizzes')}>Available Quizzes</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
