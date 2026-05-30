import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('User management /admin/users (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const cfg = loadConfig();
  const auth = (t = adminToken) => ({ Authorization: `Bearer ${t}` });
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

  it('admin creates a USER, who can then log in', async () => {
    const email = `u-${tag}@test.local`;
    const created = await request(app.getHttpServer())
      .post('/api/admin/users')
      .set(auth())
      .send({ email, fullName: 'Test User', password: 'Passw0rd!', role: 'USER' })
      .expect(201);
    expect(created.body).toMatchObject({ email, role: 'USER', isActive: true });
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'Passw0rd!' })
      .expect(201);
    expect(typeof login.body.token).toBe('string');
  });

  it('a USER cannot access /admin/users (403)', async () => {
    const email = `u2-${tag}@test.local`;
    await request(app.getHttpServer())
      .post('/api/admin/users')
      .set(auth())
      .send({ email, fullName: 'Plain', password: 'Passw0rd!', role: 'USER' })
      .expect(201);
    const userToken = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Passw0rd!' })
    ).body.token;
    await request(app.getHttpServer()).get('/api/admin/users').set(auth(userToken)).expect(403);
  });

  it('rejects a duplicate email (409)', async () => {
    const email = `dup-${tag}@test.local`;
    await request(app.getHttpServer())
      .post('/api/admin/users')
      .set(auth())
      .send({ email, fullName: 'A', password: 'Passw0rd!', role: 'USER' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/admin/users')
      .set(auth())
      .send({ email, fullName: 'B', password: 'Passw0rd!', role: 'USER' })
      .expect(409);
  });

  it('anonymizes a user (PII obfuscated, deactivated) and blocks self-anonymization', async () => {
    const email = `anon-${tag}@test.local`;
    const u = (
      await request(app.getHttpServer())
        .post('/api/admin/users')
        .set(auth())
        .send({ email, fullName: 'Bye', password: 'Passw0rd!', role: 'USER' })
    ).body;
    await request(app.getHttpServer()).delete(`/api/admin/users/${u.id}`).set(auth()).expect(200);
    const after = await request(app.getHttpServer())
      .get(`/api/admin/users/${u.id}`)
      .set(auth())
      .expect(200);
    expect(after.body.isActive).toBe(false);
    expect(after.body.anonymizedAt).not.toBeNull();
    expect(after.body.email).not.toBe(email);
    const me = await request(app.getHttpServer()).get('/api/auth/me').set(auth());
    await request(app.getHttpServer())
      .delete(`/api/admin/users/${me.body.id}`)
      .set(auth())
      .expect(422);
  });
});
