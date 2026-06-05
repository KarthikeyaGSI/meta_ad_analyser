import request from 'supertest';
import app from '../../backend/src/index';

describe('Health endpoint', () => {
  it('should return status ONLINE', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ONLINE');
  });
});
