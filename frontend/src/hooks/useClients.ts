import { useState, useEffect } from 'react';
import api from '../services/api';

const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients');
        setClients(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const addClient = async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      setClients((prevClients) => [...prevClients, response.data]);
    } catch (err) {
      setError(err);
    }
  };

  const updateClient = async (clientId, updatedData) => {
    try {
      const response = await api.put(`/clients/${clientId}`, updatedData);
      setClients((prevClients) =>
        prevClients.map((client) => (client.id === clientId ? response.data : client))
      );
    } catch (err) {
      setError(err);
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await api.delete(`/clients/${clientId}`);
      setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
    } catch (err) {
      setError(err);
    }
  };

  return { clients, loading, error, addClient, updateClient, deleteClient };
};

export default useClients;