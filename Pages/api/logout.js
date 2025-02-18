
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const serialized = serialize('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expire the cookie immediately
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);
    res.status(200).json({ message: 'Logout successful' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
