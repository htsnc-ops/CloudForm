import { Client } from '../models/client';

class StorageService {
  private clients: Client[] = [];
  private storage = new Map<string, string>();

  public async get(key: string): Promise<{ value: string | null }> {
    return { value: this.storage.get(key) || null };
  }

  public async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  public getClients(): Client[] {
    return this.clients;
  }

  public addClient(clientData: Omit<Client, 'id'>): Client {
    const newClient: Client = { 
      id: Date.now().toString(), 
      ...clientData
    };
    this.clients.push(newClient);
    return newClient;
  }

  public updateClient(updatedClient: Client): Client | null {
    const index = this.clients.findIndex(client => client.id === updatedClient.id);
    if (index !== -1) {
      this.clients[index] = updatedClient;
      return updatedClient;
    }
    return null;
  }

  public deleteClient(clientId: string): boolean {
    const index = this.clients.findIndex(client => client.id === clientId);
    if (index !== -1) {
      this.clients.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default new StorageService();