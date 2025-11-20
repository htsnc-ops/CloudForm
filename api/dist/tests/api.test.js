"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { app } = require('../server');
describe('API Endpoints', () => {
    describe('POST /api/auth/login', () => {
        it('should return 200 and a token for valid credentials', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'admin123' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });
        it('should return 401 for invalid credentials', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });
    });
    describe('GET /api/clients', () => {
        it('should return 401 without token', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/clients');
            expect(response.status).toBe(401);
        });
    });
});
