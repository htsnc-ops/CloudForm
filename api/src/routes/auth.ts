import { Router } from 'express';
import { login, logout } from '../controllers/authController';
import authenticate from '../middleware/authMiddleware';

const router = Router();

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', authenticate, logout);

export default router;