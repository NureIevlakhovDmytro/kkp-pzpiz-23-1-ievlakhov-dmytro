import { INestApplication } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
import { bootstrapTestApp } from './helpers';
import { loadConfig } from '../src/config/env';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const cfg = loadConfig();

  beforeAll(async () => { app = await bootstrapTestApp(); });
  afterAll(async () => { await app.close(); });

  it('GET /api/health -> 200', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('rejects /api/auth/me without token (401, error shape)', async () => {
    const res = await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('logs in the seeded ADMIN and returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: cfg.admin.password })
      .expect(201);
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects bad credentials (401)', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: 'nope' })
      .expect(401);
  });

  it('returns the profile of the authenticated user', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: cfg.admin.password });
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);
    expect(res.body).toMatchObject({ email: cfg.admin.email, role: 'ADMIN' });
  });

  it('updates locale via PATCH /api/auth/me', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: cfg.admin.password });
    const res = await request(app.getHttpServer())
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ locale: 'en' })
      .expect(200);
    expect(res.body.locale).toBe('en');
    // restore to keep test idempotent
    await request(app.getHttpServer())
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ locale: 'uk' });
  });
});
