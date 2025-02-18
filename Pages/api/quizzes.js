
import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies'; 

export default async function handler(req, res) {
  try {
    // 1. **Get the JWT from the cookie:**
    const cookies = parseCookies({ req });
    const token = cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // 2. **Verify the JWT:**
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. **Authorization **
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 4. **Access Granted:**  
    if (req.method === 'GET') {
      // Your logic to fetch quizzes for admins
      return res.status(200).json({ quizzes: [{ id: 1, title: 'Sample Quiz' }] }); // Replace with actual data
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    // JWT verification errors 
    return res.status(401).json({ message: 'Authentication failed' });
  }
}
