import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export const authenticateUser = (username: string, password: string) => {
  // Replace this with your actual user authentication logic
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return { token };
  }
  throw new Error('Invalid credentials');
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const { token } = authenticateUser(username, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = (req: Request, res: Response) => {
  // Invalidate the token on the client side
  res.json({ message: 'Logged out successfully' });
};