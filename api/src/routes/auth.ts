import { Router } from 'express';
import { login, logout } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Login route
router.post('/login', login);
// Logout route
router.post('/logout', authMiddleware, logout);

export default router;