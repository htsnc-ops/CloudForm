const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

export const api = {
  clients: {
    list: async () => {
      const response = await fetch(`${API_BASE_URL}/clients`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
    
    create: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create client');
      return response.json();
    },
    
    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client');
      return response.json();
    },
  },
};
