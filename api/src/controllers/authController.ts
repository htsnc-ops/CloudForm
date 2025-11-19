import { Request, Response, NextFunction } from 'express';
import { authenticateUser, verifyToken } from '../services/authService';

// Login controller
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const { token } = authenticateUser(username, password);
    res.status(200).json({ token });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    res.status(401).json({ message: errorMessage });
  }
};

// Logout controller
export const logout = (req: Request, res: Response) => {
  // Invalidate the user's session or token here
  res.status(200).json({ message: 'Logged out successfully' });
};

// Middleware to check authentication
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};