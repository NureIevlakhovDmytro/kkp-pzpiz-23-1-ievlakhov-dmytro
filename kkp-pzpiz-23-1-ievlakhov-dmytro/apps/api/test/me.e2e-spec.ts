import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('GDPR self-service /me (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const cfg = loadConfig();
  const tag = Date.now();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    adminToken = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: cfg.admin.email, password: cfg.admin.password })
    ).body.token;
  });
  afterAll(async () => {
    await app.close();
  });

  const makeUser = async () => {
    const email = `me-${tag}-${Math.floor(Math.random() * 1e6)}@test.local`;
    await request(app.getHttpServer())
      .post('/api/admin/users')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ email, fullName: 'Me User', password: 'Passw0rd!', role: 'USER' });
    const token = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Passw0rd!' })
    ).body.token;
    return { email, token };
  };

  it('exports the caller own personal data', async () => {
    const { email, token } = await makeUser();
    const res = await request(app.getHttpServer())
      .get('/api/me/export')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
    expect(res.body).toMatchObject({ email, fullName: 'Me User', role: 'USER' });
  });

  it('erases (anonymizes) the caller account; the old credentials stop working', async () => {
    const { email, token } = await makeUser();
    await request(app.getHttpServer())
      .delete('/api/me')
      .set({ Authorization: `Bearer ${token}` })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'Passw0rd!' })
      .expect(401);
  });
});
