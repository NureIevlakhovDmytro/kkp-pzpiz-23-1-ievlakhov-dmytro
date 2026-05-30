import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('Data export/import /admin (e2e)', () => {
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

  it('exports categories as JSON', async () => {
    await request(app.getHttpServer())
      .post('/api/categories')
      .set(auth())
      .send({ name: `Exp-${tag}` })
      .expect(201);
    const res = await request(app.getHttpServer())
      .get('/api/admin/export?entity=categories&format=json')
      .set(auth())
      .expect(200);
    const data = JSON.parse(res.text);
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((c: any) => c.name === `Exp-${tag}`)).toBe(true);
  });

  it('rejects an unknown entity (400)', async () => {
    await request(app.getHttpServer()).get('/api/admin/export?entity=nope').set(auth()).expect(400);
  });

  it('imports categories (upsert by natural key)', async () => {
    const name = `Imp-${tag}`;
    const payload = JSON.stringify([{ name, isActive: true }]);
    const first = await request(app.getHttpServer())
      .post('/api/admin/import')
      .set(auth())
      .send({ entity: 'categories', format: 'json', payload })
      .expect(201);
    expect(first.body).toMatchObject({ entity: 'categories', created: 1, updated: 0 });
    const second = await request(app.getHttpServer())
      .post('/api/admin/import')
      .set(auth())
      .send({ entity: 'categories', format: 'json', payload })
      .expect(201);
    expect(second.body).toMatchObject({ created: 0, updated: 1 });
  });

  it('reports per-row errors without failing the whole import', async () => {
    const payload = JSON.stringify([{ isActive: true }]);
    const res = await request(app.getHttpServer())
      .post('/api/admin/import')
      .set(auth())
      .send({ entity: 'categories', format: 'json', payload })
      .expect(201);
    expect(res.body.errors.length).toBe(1);
    expect(res.body.created).toBe(0);
  });

  it('a USER cannot export (403)', async () => {
    const email = `dx-${tag}@test.local`;
    await request(app.getHttpServer())
      .post('/api/admin/users')
      .set(auth())
      .send({ email, fullName: 'DX', password: 'Passw0rd!', role: 'USER' });
    const userToken = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Passw0rd!' })
    ).body.token;
    await request(app.getHttpServer())
      .get('/api/admin/export?entity=categories')
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(403);
  });
});
