import { Client } from '../models/client';
import { getStorage, setStorage } from './storage';

export class ContainerManager {
  private clients: Client[];

  constructor() {
    this.clients = [];
    this.loadClients();
  }

  private async loadClients() {
    const storedClients = await getStorage('cloud-portal-clients');
    if (storedClients) {
      this.clients = JSON.parse(storedClients);
    }
  }

  public async addClient(clientData: Client) {
    clientData.id = Date.now().toString();
    this.clients.push(clientData);
    await this.saveClients();
  }

  public async removeClient(clientId: string) {
    this.clients = this.clients.filter(client => client.id !== clientId);
    await this.saveClients();
  }

  public getClients() {
    return this.clients;
  }

  private async saveClients() {
    await setStorage('cloud-portal-clients', JSON.stringify(this.clients));
  }

  public async getClientById(clientId: string) {
    return this.clients.find(client => client.id === clientId);
  }
}