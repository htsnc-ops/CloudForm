"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StorageService {
    constructor() {
        this.clients = [];
        this.storage = new Map();
    }
    async get(key) {
        return { value: this.storage.get(key) || null };
    }
    async set(key, value) {
        this.storage.set(key, value);
    }
    getClients() {
        return this.clients;
    }
    addClient(clientData) {
        const newClient = {
            id: Date.now().toString(),
            ...clientData
        };
        this.clients.push(newClient);
        return newClient;
    }
    updateClient(updatedClient) {
        const index = this.clients.findIndex(client => client.id === updatedClient.id);
        if (index !== -1) {
            this.clients[index] = updatedClient;
            return updatedClient;
        }
        return null;
    }
    deleteClient(clientId) {
        const index = this.clients.findIndex(client => client.id === clientId);
        if (index !== -1) {
            this.clients.splice(index, 1);
            return true;
        }
        return false;
    }
}
exports.default = new StorageService();
