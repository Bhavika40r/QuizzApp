
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // 1. **Authentication:** 
    if (username === 'admin' && password === 'password') {
      // 2. **JWT Creation:**
      const token = jwt.sign(
        {
          username: username,
          role: 'admin', 
        },
        process.env.JWT_SECRET,  // Use a strong, secret key from env vars
        { expiresIn: '60m' } // Token expires in 60 minutes
      );

      // 3. **Set HTTP-Only Cookie:**
      const serialized = serialize('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 60 * 60, // 60 minutes in seconds
        path: '/', // Cookie valid for the entire site
      });

      res.setHeader('Set-Cookie', serialized);
      return res.status(200).json({ message: 'Login successful' }); // Don't return the token!
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
