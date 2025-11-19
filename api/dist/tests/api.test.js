"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server"); // Assuming your Express app is exported from server.ts
describe('API Endpoints', () => {
    describe('POST /auth/login', () => {
        it('should return 200 and a token for valid credentials', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .post('/auth/login')
                .send({ username: 'admin', password: 'admin123' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });
        it('should return 401 for invalid credentials', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .post('/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message', 'Invalid credentials');
        });
    });
    describe('GET /clients', () => {
        it('should return a list of clients', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .get('/clients')
                .set('Authorization', 'Bearer valid_token'); // Replace with a valid token
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
    describe('POST /clients', () => {
        it('should create a new client and return it', async () => {
            const newClient = {
                name: 'Client A',
                cloudProvider: 'azure',
                credentials: {
                    type: 'service-principal',
                    clientId: 'client_id',
                    clientSecret: 'client_secret',
                    tenantId: 'tenant_id',
                    subscriptionId: 'subscription_id'
                }
            };
            const response = await (0, supertest_1.default)(server_1.app)
                .post('/clients')
                .send(newClient)
                .set('Authorization', 'Bearer valid_token'); // Replace with a valid token
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(newClient.name);
        });
    });
    describe('GET /terminal', () => {
        it('should return terminal output for a connected client', async () => {
            const response = await (0, supertest_1.default)(server_1.app)
                .get('/terminal')
                .set('Authorization', 'Bearer valid_token'); // Replace with a valid token
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('output');
        });
    });
});
