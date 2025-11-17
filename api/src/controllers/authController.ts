import { Request, Response } from 'express';
import { authService } from '../services/authService';

// Login controller
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const token = await authService.login(username, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Logout controller
export const logout = (req: Request, res: Response) => {
  // Invalidate the user's session or token here
  res.status(200).json({ message: 'Logged out successfully' });
};

// Middleware to check authentication
export const isAuthenticated = (req: Request, res: Response, next: Function) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};