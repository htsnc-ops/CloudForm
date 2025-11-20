"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientById = exports.deleteClient = exports.updateClient = exports.addClient = exports.getClients = void 0;
const storage_1 = __importDefault(require("../services/storage"));
// Get all clients
const getClients = async (req, res) => {
    try {
        const clients = await storage_1.default.get('cloud-portal-clients');
        res.status(200).json(JSON.parse(clients.value || '[]'));
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve clients' });
    }
};
exports.getClients = getClients;
// Add a new client
const addClient = async (req, res) => {
    const { clientName, cloudProvider, authType, clientId, clientSecret, tenantId, subscriptionId } = req.body;
    if (!clientName) {
        return res.status(400).json({ message: 'Client name is required' });
    }
    const newClient = {
        id: Date.now().toString(),
        name: clientName,
        cloudProvider,
        credentials: {
            type: authType,
            clientId,
            clientSecret,
            tenantId,
            subscriptionId,
        },
        containerEndpoint: `https://container-${Date.now()}.local:8443`,
        createdAt: new Date().toISOString(),
    };
    try {
        const clients = await storage_1.default.get('cloud-portal-clients');
        const updatedClients = [...(JSON.parse(clients.value || '[]')), newClient];
        await storage_1.default.set('cloud-portal-clients', JSON.stringify(updatedClients));
        res.status(201).json(newClient);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to add client' });
    }
};
exports.addClient = addClient;
// Update a client
const updateClient = async (req, res) => {
    const { id } = req.params;
    const clientData = req.body;
    try {
        const clients = await storage_1.default.get('cloud-portal-clients');
        const clientList = JSON.parse(clients.value || '[]');
        const index = clientList.findIndex(client => client.id === id);
        if (index === -1) {
            return res.status(404).json({ message: 'Client not found' });
        }
        clientList[index] = { ...clientList[index], ...clientData, id };
        await storage_1.default.set('cloud-portal-clients', JSON.stringify(clientList));
        res.status(200).json(clientList[index]);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update client' });
    }
};
exports.updateClient = updateClient;
// Delete a client
const deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const clients = await storage_1.default.get('cloud-portal-clients');
        const updatedClients = JSON.parse(clients.value || '[]').filter((client) => client.id !== id);
        await storage_1.default.set('cloud-portal-clients', JSON.stringify(updatedClients));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete client' });
    }
};
exports.deleteClient = deleteClient;
// Get client by ID
const getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const clients = await storage_1.default.get('cloud-portal-clients');
        const clientList = JSON.parse(clients.value || '[]');
        const client = clientList.find(c => c.id === id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve client' });
    }
};
exports.getClientById = getClientById;
