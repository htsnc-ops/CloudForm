import { Client } from '../models/client';
import storage from './storage';

export class ContainerManager {
  private clients: Client[];

  constructor() {
    this.clients = [];
    this.loadClients();
  }

  private async loadClients() {
    const storedClients = await storage.get('cloud-portal-clients');
    if (storedClients.value) {
      this.clients = JSON.parse(storedClients.value);
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
    await storage.set('cloud-portal-clients', JSON.stringify(this.clients));
  }

  public async getClientById(clientId: string) {
    return this.clients.find(client => client.id === clientId);
  }

  public async executeCommand(clientId: string, command: string): Promise<string> {
    // Simulate command execution
    const client = await this.getClientById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    return `Executed command "${command}" on client ${client.name}`;
  }

  public async getStatus(clientId: string): Promise<string> {
    const client = await this.getClientById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    return 'connected';
  }
}