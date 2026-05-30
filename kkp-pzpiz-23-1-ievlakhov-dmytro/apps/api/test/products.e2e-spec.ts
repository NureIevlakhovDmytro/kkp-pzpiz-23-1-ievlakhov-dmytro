import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { bootstrapTestApp } from './helpers';
import { loadConfig } from '../src/config/env';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let categoryId: string;
  const cfg = loadConfig();
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    app = await bootstrapTestApp();
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ email: cfg.admin.email, password: cfg.admin.password });
    token = login.body.token;
    unitId = (await request(app.getHttpServer()).post('/api/units').set(auth()).send({ code: `pu${Date.now()}`, name: 'kg' })).body.id;
    categoryId = (await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name: `PCat-${Date.now()}` })).body.id;
  });
  afterAll(async () => { await app.close(); });

  it('creates a product referencing an active unit + category', async () => {
    const res = await request(app.getHttpServer()).post('/api/products').set(auth())
      .send({ name: `Prod-${Date.now()}`, unitId, categoryId, minStock: 5 }).expect(201);
    expect(res.body).toMatchObject({ unitId, categoryId, minStock: 5, isActive: true });
  });

  it('rejects creating a product with an unknown unit (404)', async () => {
    await request(app.getHttpServer()).post('/api/products').set(auth())
      .send({ name: 'X', unitId: '00000000-0000-0000-0000-000000000000' }).expect(404);
  });

  it('rejects creating a product against an archived category (422)', async () => {
    const c = await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name: `Arch-${Date.now()}` });
    await request(app.getHttpServer()).delete(`/api/categories/${c.body.id}`).set(auth()).expect(200);
    const res = await request(app.getHttpServer()).post('/api/products').set(auth())
      .send({ name: 'Y', unitId, categoryId: c.body.id }).expect(422);
    expect(res.body.code).toBe('BUSINESS_RULE');
  });

  it('blocks archiving a category still used by an active product (409)', async () => {
    const cat = (await request(app.getHttpServer()).post('/api/categories').set(auth()).send({ name: `Used-${Date.now()}` })).body;
    await request(app.getHttpServer()).post('/api/products').set(auth()).send({ name: `P2-${Date.now()}`, unitId, categoryId: cat.id }).expect(201);
    const res = await request(app.getHttpServer()).delete(`/api/categories/${cat.id}`).set(auth()).expect(409);
    expect(res.body.code).toBe('CONFLICT');
  });
});
