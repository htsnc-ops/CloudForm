import { Client } from '../models/client';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  private clients: Client[] = [];

  constructor() {
    this.loadClients();
  }

  private loadClients() {
    const storedClients = localStorage.getItem('cloud-portal-clients');
    if (storedClients) {
      this.clients = JSON.parse(storedClients);
    }
  }

  private saveClients() {
    localStorage.setItem('cloud-portal-clients', JSON.stringify(this.clients));
  }

  public getClients(): Client[] {
    return this.clients;
  }

  public addClient(clientData: Omit<Client, 'id'>): Client {
    const newClient: Client = { id: uuidv4(), ...clientData };
    this.clients.push(newClient);
    this.saveClients();
    return newClient;
  }

  public updateClient(updatedClient: Client): Client | null {
    const index = this.clients.findIndex(client => client.id === updatedClient.id);
    if (index !== -1) {
      this.clients[index] = updatedClient;
      this.saveClients();
      return updatedClient;
    }
    return null;
  }

  public deleteClient(clientId: string): boolean {
    const index = this.clients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      this.clients.splice(index, 1);
      this.saveClients();
      return true;
    }
    return false;
  }
}

export default new StorageService();