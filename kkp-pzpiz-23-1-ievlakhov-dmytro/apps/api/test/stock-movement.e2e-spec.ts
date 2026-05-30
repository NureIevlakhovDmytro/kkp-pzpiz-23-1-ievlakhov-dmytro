import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('Stock-movement report (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let productId: string;
  let fromId: string;
  let toId: string;
  let currencyId: string;
  let spoilageReasonId: string;
  let batchId: string;
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
    unitId = (
      await request(app.getHttpServer())
        .post('/api/units')
        .set(auth())
        .send({ code: `mv${tag}`, name: 'kg' })
    ).body.id;
    productId = (
      await request(app.getHttpServer())
        .post('/api/products')
        .set(auth())
        .send({ name: `MV-Prod-${tag}`, unitId })
    ).body.id;
    fromId = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `MV-From-${tag}` })
    ).body.id;
    toId = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `MV-To-${tag}` })
    ).body.id;
    currencyId = (
      await request(app.getHttpServer()).get('/api/currencies').set(auth())
    ).body.items.find((c: any) => c.code === 'UAH').id;
    spoilageReasonId = (
      await request(app.getHttpServer()).get('/api/write-off-reasons').set(auth())
    ).body.find((r: any) => r.code === 'SPOILAGE').id;

    const receipt = await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId: fromId,
        date: '2026-05-15',
        lines: [{ productId, batchNumber: `MVB-${tag}`, quantity: 40, unitCost: 10, currencyId }],
      });
    batchId = receipt.body.lines[0].batchId;
    await request(app.getHttpServer())
      .post('/api/transfers')
      .set(auth())
      .send({
        fromLocationId: fromId,
        toLocationId: toId,
        date: '2026-05-16',
        lines: [{ batchId, quantity: 15 }],
      });
    await request(app.getHttpServer())
      .post('/api/write-offs')
      .set(auth())
      .send({
        date: '2026-05-17',
        reasonId: spoilageReasonId,
        lines: [{ batchId, locationId: fromId, quantity: 5 }],
      });
  });
  afterAll(async () => {
    await app.close();
  });

  it('reconstructs the movement ledger for the product', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/reports/stock-movement?from=2026-05-01&to=2026-05-31&productId=${productId}`)
      .set(auth())
      .expect(200);
    const types = res.body.map((r: any) => r.documentType);
    expect(types).toEqual(
      expect.arrayContaining(['RECEIPT', 'TRANSFER_OUT', 'TRANSFER_IN', 'WRITE_OFF']),
    );
    // net change for the batch across all locations = 40 (receipt) -15 +15 (transfer) -5 (write-off) = 35
    const net = res.body.reduce((s: number, r: any) => s + r.quantityChange, 0);
    expect(net).toBe(35);
  });

  it('filters by location', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/api/reports/stock-movement?from=2026-05-01&to=2026-05-31&productId=${productId}&locationId=${toId}`,
      )
      .set(auth())
      .expect(200);
    // at the destination only the TRANSFER_IN (+15) appears
    expect(res.body.every((r: any) => r.locationId === toId)).toBe(true);
    expect(res.body.reduce((s: number, r: any) => s + r.quantityChange, 0)).toBe(15);
  });
});
