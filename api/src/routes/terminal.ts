import { Router } from 'express';
import { executeCommand } from '../controllers/terminalController';
import authenticate from '../middleware/authMiddleware';

const router = Router();

// Route to execute a command in the terminal
router.post('/execute', authenticate, executeCommand);

export default router;