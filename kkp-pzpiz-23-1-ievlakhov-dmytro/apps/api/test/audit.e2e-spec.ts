import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('Audit log (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const cfg = loadConfig();
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const tag = Date.now();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    token = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: cfg.admin.email, password: cfg.admin.password })
    ).body.token;
  });
  afterAll(async () => {
    await app.close();
  });

  it('records LOGIN on successful login', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: cfg.admin.password })
      .expect(201);
    const logs = await request(app.getHttpServer())
      .get('/api/admin/audit-logs?action=LOGIN')
      .set(auth())
      .expect(200);
    expect(logs.body.items.length).toBeGreaterThan(0);
    expect(logs.body.items[0].action).toBe('LOGIN');
  });

  it('records LOGIN_FAILED on bad credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: 'wrong' })
      .expect(401);
    const logs = await request(app.getHttpServer())
      .get('/api/admin/audit-logs?action=LOGIN_FAILED')
      .set(auth())
      .expect(200);
    expect(logs.body.items.length).toBeGreaterThan(0);
  });

  it('records REFERENCE_CHANGED when an admin creates a category', async () => {
    const before = (
      await request(app.getHttpServer())
        .get('/api/admin/audit-logs?action=REFERENCE_CHANGED')
        .set(auth())
    ).body.total;
    await request(app.getHttpServer())
      .post('/api/categories')
      .set(auth())
      .send({ name: `Audit-${tag}` })
      .expect(201);
    const after = (
      await request(app.getHttpServer())
        .get('/api/admin/audit-logs?action=REFERENCE_CHANGED')
        .set(auth())
    ).body.total;
    expect(after).toBeGreaterThan(before);
  });

  it('does NOT audit GET requests', async () => {
    const before = (await request(app.getHttpServer()).get('/api/admin/audit-logs').set(auth()))
      .body.total;
    await request(app.getHttpServer()).get('/api/products').set(auth()).expect(200);
    const after = (await request(app.getHttpServer()).get('/api/admin/audit-logs').set(auth())).body
      .total;
    expect(after).toBe(before);
  });
});
