import type { INestApplication } from '@nestjs/common';
const request = require('supertest');

import { loadConfig } from '../src/config/env';
import { bootstrapTestApp } from './helpers';

describe('Reports ★ loss structure + inventory (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let productId: string;
  let locationId: string;
  let currencyId: string;
  let batchId: string;
  let spoilageReasonId: string;
  const cfg = loadConfig();
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const tag = Date.now();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    token = (await request(app.getHttpServer()).post('/api/auth/login').send({ email: cfg.admin.email, password: cfg.admin.password })).body.token;
    unitId = (await request(app.getHttpServer()).post('/api/units').set(auth()).send({ code: `rp${tag}`, name: 'kg' })).body.id;
    productId = (await request(app.getHttpServer()).post('/api/products').set(auth()).send({ name: `RP-Prod-${tag}`, unitId })).body.id;
    locationId = (await request(app.getHttpServer()).post('/api/storage-locations').set(auth()).send({ name: `RP-Loc-${tag}` })).body.id;
    currencyId = (await request(app.getHttpServer()).get('/api/currencies').set(auth())).body.items.find((c: any) => c.code === 'UAH').id;
    spoilageReasonId = (await request(app.getHttpServer()).get('/api/write-off-reasons').set(auth())).body.find((r: any) => r.code === 'SPOILAGE').id;
    const receipt = await request(app.getHttpServer()).post('/api/receipts').set(auth())
      .send({ locationId, date: '2026-05-10', lines: [{ productId, batchNumber: `RB-${tag}`, quantity: 100, unitCost: 10, currencyId }] });
    batchId = receipt.body.lines[0].batchId;
    // a write-off (spoilage) of 6 @ 10 = 60 base (UAH = base)
    await request(app.getHttpServer()).post('/api/write-offs').set(auth())
      .send({ date: '2026-05-12', reasonId: spoilageReasonId, lines: [{ batchId, locationId, quantity: 6 }] });
  });
  afterAll(async () => { await app.close(); });

  it('loss-structure aggregates spoilage in base currency', async () => {
    const res = await request(app.getHttpServer()).get('/api/reports/loss-structure?from=2026-05-01&to=2026-05-31').set(auth()).expect(200);
    const spoilage = res.body.rows.find((r: any) => r.reasonCode === 'SPOILAGE');
    expect(spoilage).toBeDefined();
    expect(spoilage.totalBase).toBeGreaterThanOrEqual(60);
    expect(res.body.rateMissing).toBe(false);
  });

  it('loss-structure excludes a reversed write-off', async () => {
    const wo = await request(app.getHttpServer()).post('/api/write-offs').set(auth())
      .send({ date: '2026-05-13', reasonId: spoilageReasonId, lines: [{ batchId, locationId, quantity: 4 }] });
    const beforeRows = (await request(app.getHttpServer()).get('/api/reports/loss-structure?from=2026-05-01&to=2026-05-31').set(auth())).body.total;
    await request(app.getHttpServer()).post(`/api/write-offs/${wo.body.id}/reverse`).set(auth()).expect(201);
    const afterRows = (await request(app.getHttpServer()).get('/api/reports/loss-structure?from=2026-05-01&to=2026-05-31').set(auth())).body.total;
    expect(afterRows).toBe(beforeRows - 40); // the reversed 4 @ 10 dropped out
  });

  it('inventory report reflects a counted shortage', async () => {
    const inv = (await request(app.getHttpServer()).post('/api/inventory-counts').set(auth()).send({ locationId, date: '2026-05-20' })).body;
    await request(app.getHttpServer()).patch(`/api/inventory-counts/${inv.id}`).set(auth())
      .send({ counts: [{ batchId, actualQty: 80 }] }).expect(200);
    await request(app.getHttpServer()).post(`/api/inventory-counts/${inv.id}/complete`).set(auth()).expect(201);
    const report = await request(app.getHttpServer()).get(`/api/reports/inventory/${inv.id}`).set(auth()).expect(200);
    expect(report.body.shortageCount).toBe(1);
    expect(report.body.shortageTotalBase).toBeGreaterThan(0);
  });
});
