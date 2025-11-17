import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  cloudProvider: string;
  authType: string;
  status: string;
  createdAt?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.clients.list();
      // setClients(response);
      
      // Mock data for now
      setClients([
        {
          id: '1',
          name: 'Demo Client A',
          cloudProvider: 'azure',
          authType: 'service-principal',
          status: 'ready',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = (client: Client) => {
    setClients([...clients, client]);
  };

  const removeClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  return {
    clients,
    loading,
    error,
    fetchClients,
    addClient,
    removeClient,
  };
};
