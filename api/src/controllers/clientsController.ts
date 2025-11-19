import { Request, Response } from 'express';
import { Client } from '../models/client';
import storage from '../services/storage';

// Get all clients
export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await storage.get('cloud-portal-clients');
    res.status(200).json(JSON.parse(clients.value || '[]'));
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve clients' });
  }
};

// Add a new client
export const addClient = async (req: Request, res: Response) => {
  const { clientName, cloudProvider, authType, clientId, clientSecret, tenantId, subscriptionId } = req.body;

  if (!clientName) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  const newClient: Client = {
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
    const clients = await storage.get('cloud-portal-clients');
    const updatedClients = [...(JSON.parse(clients.value || '[]')), newClient];
    await storage.set('cloud-portal-clients', JSON.stringify(updatedClients));
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add client' });
  }
};

// Update a client
export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const clientData = req.body;

  try {
    const clients = await storage.get('cloud-portal-clients');
    const clientList: Client[] = JSON.parse(clients.value || '[]');
    const index = clientList.findIndex(client => client.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Client not found' });
    }

    clientList[index] = { ...clientList[index], ...clientData, id };
    await storage.set('cloud-portal-clients', JSON.stringify(clientList));
    res.status(200).json(clientList[index]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update client' });
  }
};

// Delete a client
export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const clients = await storage.get('cloud-portal-clients');
    const updatedClients = JSON.parse(clients.value || '[]').filter((client: Client) => client.id !== id);
    await storage.set('cloud-portal-clients', JSON.stringify(updatedClients));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete client' });
  }
};

// Get client by ID
export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const clients = await storage.get('cloud-portal-clients');
    const clientList: Client[] = JSON.parse(clients.value || '[]');
    const client = clientList.find(c => c.id === id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve client' });
  }
};