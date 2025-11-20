"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerManager = void 0;
const storage_1 = __importDefault(require("./storage"));
class ContainerManager {
    constructor() {
        this.clients = [];
        this.loadClients();
    }
    async loadClients() {
        const storedClients = await storage_1.default.get('cloud-portal-clients');
        if (storedClients.value) {
            this.clients = JSON.parse(storedClients.value);
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
        await storage_1.default.set('cloud-portal-clients', JSON.stringify(this.clients));
    }
    async getClientById(clientId) {
        return this.clients.find(client => client.id === clientId);
    }
    async executeCommand(clientId, command) {
        // Simulate command execution
        const client = await this.getClientById(clientId);
        if (!client) {
            throw new Error('Client not found');
        }
        return `Executed command "${command}" on client ${client.name}`;
    }
    async getStatus(clientId) {
        const client = await this.getClientById(clientId);
        if (!client) {
            throw new Error('Client not found');
        }
        return 'connected';
    }
}
exports.ContainerManager = ContainerManager;
