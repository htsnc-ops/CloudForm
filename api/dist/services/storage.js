"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class StorageService {
    constructor() {
        this.clients = [];
        this.loadClients();
    }
    loadClients() {
        const storedClients = localStorage.getItem('cloud-portal-clients');
        if (storedClients) {
            this.clients = JSON.parse(storedClients);
        }
    }
    saveClients() {
        localStorage.setItem('cloud-portal-clients', JSON.stringify(this.clients));
    }
    getClients() {
        return this.clients;
    }
    addClient(clientData) {
        const newClient = { id: (0, uuid_1.v4)(), ...clientData };
        this.clients.push(newClient);
        this.saveClients();
        return newClient;
    }
    updateClient(updatedClient) {
        const index = this.clients.findIndex(client => client.id === updatedClient.id);
        if (index !== -1) {
            this.clients[index] = updatedClient;
            this.saveClients();
            return updatedClient;
        }
        return null;
    }
    deleteClient(clientId) {
        const index = this.clients.findIndex(client => client.id === clientId);
        if (index !== -1) {
            this.clients.splice(index, 1);
            this.saveClients();
            return true;
        }
        return false;
    }
}
exports.default = new StorageService();
