"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientsController_1 = require("../controllers/clientsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to get all clients
router.get('/', authMiddleware_1.authenticate, clientsController_1.getClients);
// Route to add a new client
router.post('/', authMiddleware_1.authenticate, clientsController_1.addClient);
// Route to update an existing client
router.put('/:id', authMiddleware_1.authenticate, clientsController_1.updateClient);
// Route to delete a client
router.delete('/:id', authMiddleware_1.authenticate, clientsController_1.deleteClient);
// Route to get a client by ID
router.get('/:id', authMiddleware_1.authenticate, clientsController_1.getClientById);
exports.default = router;
