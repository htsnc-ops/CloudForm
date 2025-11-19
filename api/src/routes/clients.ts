import { Router } from 'express';
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
  getClientById
} from '../controllers/clientsController';
import authenticate from '../middleware/authMiddleware';

const router = Router();

// Route to get all clients
router.get('/', authenticate, getClients);

// Route to add a new client
router.post('/', authenticate, addClient);

// Route to update an existing client
router.put('/:id', authenticate, updateClient);

// Route to delete a client
router.delete('/:id', authenticate, deleteClient);

// Route to get a client by ID
router.get('/:id', authenticate, getClientById);

export default router;