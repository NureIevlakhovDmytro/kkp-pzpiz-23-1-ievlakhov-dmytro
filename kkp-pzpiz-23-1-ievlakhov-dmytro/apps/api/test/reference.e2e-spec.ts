import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { bootstrapTestApp } from './helpers';
import { loadConfig } from '../src/config/env';

describe('Reference dictionaries (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const cfg = loadConfig();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: cfg.admin.email, password: cfg.admin.password });
    adminToken = res.body.token;
  });
  afterAll(async () => { await app.close(); });

  const auth = () => ({ Authorization: `Bearer ${adminToken}` });

  it('ADMIN creates a category; any authed user can read it', async () => {
    const name = `Cat-${Date.now()}`;
    const created = await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name }).expect(201);
    expect(created.body).toMatchObject({ name, isActive: true });
    const list = await request(app.getHttpServer()).get('/api/categories').set(auth()).expect(200);
    expect(list.body.items.some((c: any) => c.id === created.body.id)).toBe(true);
  });

  it('archived category disappears from default list but returns with includeInactive', async () => {
    const name = `Cat-${Date.now()}-arch`;
    const c = await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name }).expect(201);
    await request(app.getHttpServer()).delete(`/api/categories/${c.body.id}`).set(auth()).expect(200);
    const def = await request(app.getHttpServer()).get('/api/categories').set(auth()).expect(200);
    expect(def.body.items.some((x: any) => x.id === c.body.id)).toBe(false);
    const inc = await request(app.getHttpServer()).get('/api/categories?includeInactive=true&limit=200').set(auth()).expect(200);
    expect(inc.body.items.some((x: any) => x.id === c.body.id)).toBe(true);
  });

  it('the same name can be reused after the previous holder is archived', async () => {
    const name = `Cat-reuse-${Date.now()}`;
    const a = await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name }).expect(201);
    await request(app.getHttpServer()).delete(`/api/categories/${a.body.id}`).set(auth()).expect(200);
    await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name }).expect(201);
  });

  it('duplicate active name is rejected with 409', async () => {
    const name = `Cat-dup-${Date.now()}`;
    await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name }).expect(201);
    const dup = await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name }).expect(409);
    expect(dup.body.code).toBe('CONFLICT');
  });

  it('creates a unit (code+name)', async () => {
    const code = `u${Date.now()}`;
    const u = await request(app.getHttpServer()).post('/api/units').set(auth()).send({ code, name: 'Kilogram' }).expect(201);
    expect(u.body).toMatchObject({ code, name: 'Kilogram', isActive: true });
  });
});
