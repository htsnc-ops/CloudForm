import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientCard } from './ClientCard';
import { useClients } from '../../hooks/useClients';

const ClientsList = () => {
  const { clients, loading, error } = useClients(); // Get list of clients
  const navigate = useNavigate(); // Get navigation function

  if (loading) {
    return <div className="text-center text-slate-400">Loading clients...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading clients: {error}</div>;
  }

  // This function handles what happens when a card is clicked
  const handleClientClick = (client: any) => {
    navigate(`/terminal/${client.id}`), { 
      state: { 
        cloudProvider: client.cloudProvider,  // This specific client's provider
        name: client.name                      // This specific client's name
      } };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.length === 0 ? (
        <div className="text-center text-slate-400 col-span-full">
          No client identities configured. Click "Add Client" to create your first identity.
        </div>
      ) : (
        clients.map(client => (
        <ClientCard 
          key={client.id} 
          id={client.id}
          name={client.name}
          cloudProvider={client.cloudProvider}
          status={client.status}
          onClick={() => handleClientClick(client)}
        />
        ))
      )}
    </div>
  );
};

export default ClientsList;