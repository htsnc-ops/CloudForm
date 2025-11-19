"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerManager = void 0;
const storage_1 = require("./storage");
class ContainerManager {
    constructor() {
        this.clients = [];
        this.loadClients();
    }
    async loadClients() {
        const storedClients = await (0, storage_1.getStorage)('cloud-portal-clients');
        if (storedClients) {
            this.clients = JSON.parse(storedClients);
        }
    }
    async addClient(clientData) {
        clientData.id = Date.now().toString();
        this.clients.push(clientData);
        await this.saveClients();
    }
    async removeClient(clientId) {
        this.clients = this.clients.filter(client => client.id !== clientId);
        await this.saveClients();
    }
    getClients() {
        return this.clients;
    }
    async saveClients() {
        await (0, storage_1.setStorage)('cloud-portal-clients', JSON.stringify(this.clients));
    }
    async getClientById(clientId) {
        return this.clients.find(client => client.id === clientId);
    }
}
exports.ContainerManager = ContainerManager;
