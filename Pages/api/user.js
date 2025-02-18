
import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';

export default async function handler(req, res) {
  try {
    const cookies = parseCookies({ req });
    const token = cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ username: decoded.username, role: decoded.role });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
