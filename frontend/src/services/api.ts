import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const login = async (password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, { password });
  return response.data;
};

export const fetchClients = async () => {
  const response = await axios.get(`${API_BASE_URL}/clients`);
  return response.data;
};

export const addClient = async (clientData) => {
  const response = await axios.post(`${API_BASE_URL}/clients`, clientData);
  return response.data;
};

export const deleteClient = async (clientId) => {
  const response = await axios.delete(`${API_BASE_URL}/clients/${clientId}`);
  return response.data;
};

export const executeCommand = async (clientId, command) => {
  const response = await axios.post(`${API_BASE_URL}/terminal/execute`, { clientId, command });
  return response.data;
};