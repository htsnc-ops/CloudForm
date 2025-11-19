"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.addClient = exports.getClients = void 0;
const storage_1 = require("../services/storage");
// Get all clients
const getClients = async (req, res) => {
    try {
        const clients = await storage_1.storage.get('cloud-portal-clients');
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
        const clients = await storage_1.storage.get('cloud-portal-clients');
        const updatedClients = [...(JSON.parse(clients.value || '[]')), newClient];
        await storage_1.storage.set('cloud-portal-clients', JSON.stringify(updatedClients));
        res.status(201).json(newClient);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to add client' });
    }
};
exports.addClient = addClient;
// Delete a client
const deleteClient = async (req, res) => {
    const { id } = req.params;
    try {
        const clients = await storage_1.storage.get('cloud-portal-clients');
        const updatedClients = JSON.parse(clients.value || '[]').filter((client) => client.id !== id);
        await storage_1.storage.set('cloud-portal-clients', JSON.stringify(updatedClients));
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete client' });
    }
};
exports.deleteClient = deleteClient;
