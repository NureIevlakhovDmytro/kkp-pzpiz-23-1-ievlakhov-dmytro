import type { INestApplication } from '@nestjs/common';
const request = require('supertest');

import { loadConfig } from '../src/config/env';
import { bootstrapTestApp } from './helpers';

describe('Inventory ★ recompute-at-complete (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let productId: string;
  let locationId: string;
  let currencyId: string;
  let batchId: string;
  const cfg = loadConfig();
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const tag = Date.now();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    token = (await request(app.getHttpServer()).post('/api/auth/login').send({ email: cfg.admin.email, password: cfg.admin.password })).body.token;
    unitId = (await request(app.getHttpServer()).post('/api/units').set(auth()).send({ code: `iv${tag}`, name: 'kg' })).body.id;
    productId = (await request(app.getHttpServer()).post('/api/products').set(auth()).send({ name: `IV-Prod-${tag}`, unitId })).body.id;
    locationId = (await request(app.getHttpServer()).post('/api/storage-locations').set(auth()).send({ name: `IV-Loc-${tag}` })).body.id;
    currencyId = (await request(app.getHttpServer()).get('/api/currencies').set(auth())).body.items.find((c: any) => c.code === 'UAH').id;
    const receipt = await request(app.getHttpServer()).post('/api/receipts').set(auth())
      .send({ locationId, date: '2026-05-30', lines: [{ productId, batchNumber: `IB-${tag}`, quantity: 100, unitCost: 10, currencyId }] });
    batchId = receipt.body.lines[0].batchId;
  });
  afterAll(async () => { await app.close(); });

  it('creates a DRAFT inventory that snapshots current stock as expected', async () => {
    const res = await request(app.getHttpServer()).post('/api/inventory-counts').set(auth())
      .send({ locationId, date: '2026-05-31' }).expect(201);
    expect(res.body.status).toBe('DRAFT');
    const line = res.body.lines.find((l: any) => l.batchId === batchId);
    expect(line.expectedQty).toBe(100);
    expect(line.actualQty).toBeNull();
  });

  it('blocks a second open DRAFT for the same location (409)', async () => {
    await request(app.getHttpServer()).post('/api/inventory-counts').set(auth())
      .send({ locationId, date: '2026-05-31' }).expect(409);
  });

  it('complete fails while a line is uncounted (409)', async () => {
    const inv = (await request(app.getHttpServer()).get(`/api/inventory-counts?locationId=${locationId}&status=DRAFT`).set(auth())).body.items[0];
    await request(app.getHttpServer()).post(`/api/inventory-counts/${inv.id}/complete`).set(auth()).expect(409);
  });

  it('counts a shortage and completes: stock set to actual, adjustment records SHORTAGE delta', async () => {
    const inv = (await request(app.getHttpServer()).get(`/api/inventory-counts?locationId=${locationId}&status=DRAFT`).set(auth())).body.items[0];
    await request(app.getHttpServer()).patch(`/api/inventory-counts/${inv.id}`).set(auth())
      .send({ counts: [{ batchId, actualQty: 90 }] }).expect(200);
    const done = await request(app.getHttpServer()).post(`/api/inventory-counts/${inv.id}/complete`).set(auth()).expect(201);
    expect(done.body.status).toBe('COMPLETED');

    const stock = (await request(app.getHttpServer()).get(`/api/stock?locationId=${locationId}`).set(auth())).body;
    expect(stock.find((r: any) => r.batchId === batchId).quantity).toBe(90); // set to actual

    const report = await request(app.getHttpServer()).get(`/api/reports/inventory/${inv.id}`).set(auth()).expect(200);
    expect(report.body.shortageCount).toBe(1);
  });
});
