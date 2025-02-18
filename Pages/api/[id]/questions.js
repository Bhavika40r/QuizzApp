
import { getSession } from 'next-auth/client'; 
import { verifyToken } from '../../../utils/auth';
import { rateLimitMiddleware } from '../../../utils/rateLimit';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //Rate Limit
  await rateLimitMiddleware(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const quizId = req.query.id; // Get the quiz ID from the URL
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token); // Replace verifyToken to check signature and expiry.
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { question_id, marks } = req.body; // Get the required field from body

    // Perform database operations to:
    // 1. Verify the quiz exists (quizId)
    // 2. Verify the question exists (question_id)
    // 3. Map the question to the quiz with the specified marks

    //For security, make sure no other request from other users is allowed

    //Simulate an insert of question_id to quiz_id, with marks.
    return res.status(201).json({ message: 'Question mapped to quiz successfully' });
    //If it fails throw a INTERNAL SERVER ERROR
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
