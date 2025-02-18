import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { username, password });

      // If login is successful, the server sets the HTTP-only cookie.
      // No need to store the token on the client-side anymore.
      if (response.status === 200) {
        router.push('/dashboard');
      } else {
        setError('Login failed'); // Generic error message
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default AdminLogin;
