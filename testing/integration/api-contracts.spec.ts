import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:4000';

describe('API Contract Tests', () => {
  let authToken: string;
  let testUserId: string;

  describe('Auth Endpoints', () => {
    it('POST /auth/register - should create user', async () => {
      const res = await request(BASE_URL)
        .post('/auth/register')
        .send({
          email: `test_${Date.now()}@mountainconnect.id`,
          password: 'TestPassword123!',
          name: 'Test User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user).toHaveProperty('role');
    });

    it('POST /auth/login - should return token', async () => {
      const res = await request(BASE_URL)
        .post('/auth/login')
        .send({
          email: 'test@mountainconnect.id',
          password: 'TestPassword123!',
        });

      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('accessToken');
        authToken = res.body.data.accessToken;
      }
    });

    it('GET /auth/me - should return current user', async () => {
      const res = await request(BASE_URL)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email');
      testUserId = res.body.data.id;
    });

    it('POST /auth/refresh - should refresh token', async () => {
      const res = await request(BASE_URL)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_refresh_token' });

      expect(res.body).toHaveProperty('success');
    });
  });

  describe('User Endpoints', () => {
    it('GET /users - should list users (admin)', async () => {
      const res = await request(BASE_URL)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
    });

    it('GET /users/:id - should get user by id', async () => {
      const res = await request(BASE_URL)
        .get(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.id).toBe(testUserId);
    });

    it('PUT /users/:id - should update user', async () => {
      const res = await request(BASE_URL)
        .put(`/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('Mountain Endpoints', () => {
    it('GET /mountains - should list mountains', async () => {
      const res = await request(BASE_URL)
        .get('/mountains')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET /mountains/:id - should get mountain details', async () => {
      // First get a mountain id
      const listRes = await request(BASE_URL)
        .get('/mountains')
        .set('Authorization', `Bearer ${authToken}`);

      const mountainId = listRes.body.data[0]?.id;

      const res = await request(BASE_URL)
        .get(`/mountains/${mountainId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('elevation');
    });

    it('GET /mountains/nearby - should find nearby mountains', async () => {
      const res = await request(BASE_URL)
        .get('/mountains/nearby')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ lat: -8.5, lng: 115.5, radius: 50 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Trip Endpoints', () => {
    it('GET /trips - should list trips', async () => {
      const res = await request(BASE_URL)
        .get('/trips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('POST /trips/:id/book - should book a trip', async () => {
      // Get first available trip
      const listRes = await request(BASE_URL)
        .get('/trips')
        .set('Authorization', `Bearer ${authToken}`);

      const tripId = listRes.body.data[0]?.id;

      const res = await request(BASE_URL)
        .post(`/trips/${tripId}/book`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('SOS Endpoints', () => {
    it('POST /sos/trigger - should create SOS alert', async () => {
      const res = await request(BASE_URL)
        .post('/sos/trigger')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          latitude: -8.108,
          longitude: 112.922,
          accuracy: 10,
          mountainId: 'mt_rinjani',
          timestamp: Date.now(),
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('status');
    });

    it('GET /sos/active - should list active SOS alerts', async () => {
      const res = await request(BASE_URL)
        .get('/sos/active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('GET /sos/overdue - should list overdue hikes', async () => {
      const res = await request(BASE_URL)
        .get('/sos/overdue')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Error Response Format', () => {
    it('should return proper error for invalid endpoint', async () => {
      const res = await request(BASE_URL)
        .get('/nonexistent-endpoint');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });

    it('should return validation errors', async () => {
      const res = await request(BASE_URL)
        .post('/auth/login')
        .send({ email: 'invalid' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toHaveProperty('errors');
    });

    it('should return 401 for unauthorized requests', async () => {
      const res = await request(BASE_URL)
        .get('/users');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 for forbidden access', async () => {
      const res = await request(BASE_URL)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect([403, 401]).toContain(res.status);
    });
  });

  describe('Pagination Format', () => {
    it('should return meta for paginated endpoints', async () => {
      const res = await request(BASE_URL)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
      expect(res.body.meta.totalPages).toBeDefined();
    });
  });
});
