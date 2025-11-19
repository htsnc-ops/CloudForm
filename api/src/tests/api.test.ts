import request from 'supertest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { app } = require('../server');

describe('API Endpoints', () => {
  describe('POST /api/auth/login', () => {
    it('should return 200 and a token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/clients', () => {
    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/clients');
      expect(response.status).toBe(401);
    });
  });
});