// components/Navbar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { destroyCookie, parseCookies } from 'nookies';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies.jwt;

    if (token) {
      // You may need to decode the JWT to get username and role on the client-side.
      // However, it's generally better to fetch this data from an API endpoint.
      // For example:
      // const decodedToken = decodeJwt(token);
      // setUsername(decodedToken.username);
      // setUserRole(decodedToken.role);
      // Or:
      // fetchUserData(token); // Define a function to fetch user data from /api/user
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call API endpoint to clear the cookie
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.status === 200) {
        destroyCookie(null, 'jwt');
        router.push('/user-login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-white text-lg font-bold">
          Online Quiz
        </Link>
        <div className="flex items-center">
          {username && (
            <span className="text-gray-300 mr-4">
              Welcome, {username} ({userRole})
            </span>
          )}
          {username ? (
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          ) : (
            <>
              <Link href="/user-login" className="text-gray-300 hover:text-white mr-4">
                User Login
              </Link>
              <Link href="/admin-login" className="text-gray-300 hover:text-white">
                Admin Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
