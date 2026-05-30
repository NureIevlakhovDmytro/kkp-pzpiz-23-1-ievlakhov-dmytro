import type { INestApplication } from '@nestjs/common';
const request = require('supertest');

import { loadConfig } from '../src/config/env';
import { bootstrapTestApp } from './helpers';

describe('Write-offs ★ (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let productId: string;
  let locationId: string;
  let currencyId: string;
  let spoilageReasonId: string;
  let batchId: string;
  const cfg = loadConfig();
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const tag = Date.now();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    token = (await request(app.getHttpServer()).post('/api/auth/login').send({ email: cfg.admin.email, password: cfg.admin.password })).body.token;
    unitId = (await request(app.getHttpServer()).post('/api/units').set(auth()).send({ code: `wo${tag}`, name: 'kg' })).body.id;
    productId = (await request(app.getHttpServer()).post('/api/products').set(auth()).send({ name: `WO-Prod-${tag}`, unitId })).body.id;
    locationId = (await request(app.getHttpServer()).post('/api/storage-locations').set(auth()).send({ name: `WO-Loc-${tag}` })).body.id;
    currencyId = (await request(app.getHttpServer()).get('/api/currencies').set(auth())).body.items.find((c: any) => c.code === 'UAH').id;
    const reasons = (await request(app.getHttpServer()).get('/api/write-off-reasons').set(auth())).body;
    spoilageReasonId = reasons.find((r: any) => r.code === 'SPOILAGE').id;
    const receipt = await request(app.getHttpServer()).post('/api/receipts').set(auth())
      .send({ locationId, date: '2026-05-30', lines: [{ productId, batchNumber: `WB-${tag}`, quantity: 50, unitCost: 10, currencyId }] });
    batchId = receipt.body.lines[0].batchId;
  });
  afterAll(async () => { await app.close(); });

  it('posts a write-off with a mandatory reason and reduces stock', async () => {
    const res = await request(app.getHttpServer()).post('/api/write-offs').set(auth())
      .send({ date: '2026-05-30', reasonId: spoilageReasonId, lines: [{ batchId, locationId, quantity: 20 }] }).expect(201);
    expect(res.body.number).toMatch(/^WO-\d{6}$/);
    expect(res.body.reasonId).toBe(spoilageReasonId);
    const stock = await request(app.getHttpServer()).get(`/api/stock?locationId=${locationId}`).set(auth());
    expect(stock.body.find((r: any) => r.batchId === batchId).quantity).toBe(30);
  });

  it('rejects a write-off without a reason (400 validation)', async () => {
    await request(app.getHttpServer()).post('/api/write-offs').set(auth())
      .send({ date: '2026-05-30', lines: [{ batchId, locationId, quantity: 1 }] }).expect(400);
  });

  it('rejects writing off more than is on hand (409)', async () => {
    const res = await request(app.getHttpServer()).post('/api/write-offs').set(auth())
      .send({ date: '2026-05-30', reasonId: spoilageReasonId, lines: [{ batchId, locationId, quantity: 9999 }] }).expect(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('reverses a write-off and restores stock', async () => {
    const posted = await request(app.getHttpServer()).post('/api/write-offs').set(auth())
      .send({ date: '2026-05-30', reasonId: spoilageReasonId, lines: [{ batchId, locationId, quantity: 5 }] }).expect(201);
    const before = (await request(app.getHttpServer()).get(`/api/stock?locationId=${locationId}`).set(auth())).body.find((r: any) => r.batchId === batchId).quantity;
    const rev = await request(app.getHttpServer()).post(`/api/write-offs/${posted.body.id}/reverse`).set(auth()).expect(201);
    expect(rev.body.reversesId).toBe(posted.body.id);
    const after = (await request(app.getHttpServer()).get(`/api/stock?locationId=${locationId}`).set(auth())).body.find((r: any) => r.batchId === batchId).quantity;
    expect(after).toBe(before + 5);
    await request(app.getHttpServer()).post(`/api/write-offs/${posted.body.id}/reverse`).set(auth()).expect(409);
  });
});
