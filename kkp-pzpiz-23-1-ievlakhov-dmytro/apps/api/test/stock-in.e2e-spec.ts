import type { INestApplication } from '@nestjs/common';

const request = require('supertest');

import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('Stock-in: receipts → stock → FEFO → reverse (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let productId: string;
  let locationId: string;
  let currencyId: string;
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
        .send({ code: `si${tag}`, name: 'kg' })
    ).body.id;
    productId = (
      await request(app.getHttpServer())
        .post('/api/products')
        .set(auth())
        .send({ name: `SI-Prod-${tag}`, unitId, minStock: 100 })
    ).body.id;
    locationId = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `SI-Loc-${tag}` })
    ).body.id;
    currencyId = (
      await request(app.getHttpServer()).get('/api/currencies').set(auth())
    ).body.items.find((c: any) => c.code === 'UAH').id;
  });
  afterAll(async () => {
    await app.close();
  });

  const lines = (qty1: number, qty2: number) => [
    {
      productId,
      batchNumber: `B1-${tag}`,
      expiryDate: '2026-06-01',
      quantity: qty1,
      unitCost: 10,
      currencyId,
    },
    {
      productId,
      batchNumber: `B2-${tag}`,
      expiryDate: '2026-12-01',
      quantity: qty2,
      unitCost: 12,
      currencyId,
    },
  ];

  it('posts a receipt: creates batches and raises stock', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({ locationId, date: '2026-05-30', lines: lines(30, 40) })
      .expect(201);
    expect(res.body.number).toMatch(/^REC-\d{6}$/);
    expect(res.body.status).toBe('POSTED');
    expect(res.body.lines).toHaveLength(2);

    const stock = await request(app.getHttpServer())
      .get(`/api/stock?productId=${productId}&locationId=${locationId}`)
      .set(auth())
      .expect(200);
    const total = stock.body.reduce((s: number, r: any) => s + r.quantity, 0);
    expect(total).toBe(70);
  });

  it('FEFO suggestion drains the earliest-expiring batch first', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/stock/fefo-suggestion?productId=${productId}&locationId=${locationId}&quantity=35`)
      .set(auth())
      .expect(200);
    expect(res.body).toMatchObject({ requested: 35, allocated: 35, shortfall: 0 });
    // earliest expiry (B1, 2026-06-01, qty 30) fully, then 5 from B2
    expect(res.body.allocations[0].allocated).toBe(30);
    expect(res.body.allocations[1].allocated).toBe(5);
  });

  it('FEFO reports shortfall when asking more than on hand', async () => {
    const res = await request(app.getHttpServer())
      .get(
        `/api/stock/fefo-suggestion?productId=${productId}&locationId=${locationId}&quantity=1000`,
      )
      .set(auth())
      .expect(200);
    expect(res.body.shortfall).toBe(930);
  });

  it('low-stock lists the product (70 < minStock 100)', async () => {
    const res = await request(app.getHttpServer()).get('/api/stock/low').set(auth()).expect(200);
    expect(res.body.some((r: any) => r.productId === productId && r.totalQuantity === 70)).toBe(
      true,
    );
  });

  it('expiring(days=400) includes the product batches', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/batches/expiring?days=400')
      .set(auth())
      .expect(200);
    expect(res.body.some((b: any) => b.productId === productId)).toBe(true);
  });

  it('idempotency: same Idempotency-Key returns the same receipt without double-posting', async () => {
    const key = `idem-${tag}`;
    const first = await request(app.getHttpServer())
      .post('/api/receipts')
      .set({ ...auth(), 'Idempotency-Key': key })
      .send({
        locationId,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `IDEM-${tag}`, quantity: 10, unitCost: 5, currencyId }],
      })
      .expect(201);
    const second = await request(app.getHttpServer())
      .post('/api/receipts')
      .set({ ...auth(), 'Idempotency-Key': key })
      .send({
        locationId,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `IDEM-${tag}`, quantity: 10, unitCost: 5, currencyId }],
      })
      .expect(201);
    expect(second.body.id).toBe(first.body.id);
  });

  it('reverse removes the stock the receipt added', async () => {
    const posted = await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `REV-${tag}`, quantity: 25, unitCost: 8, currencyId }],
      })
      .expect(201);
    const batchId = posted.body.lines[0].batchId;

    const rev = await request(app.getHttpServer())
      .post(`/api/receipts/${posted.body.id}/reverse`)
      .set(auth())
      .expect(201);
    expect(rev.body.reversesId).toBe(posted.body.id);

    const original = await request(app.getHttpServer())
      .get(`/api/receipts/${posted.body.id}`)
      .set(auth())
      .expect(200);
    expect(original.body.status).toBe('REVERSED');

    const stock = await request(app.getHttpServer())
      .get(`/api/stock?locationId=${locationId}`)
      .set(auth())
      .expect(200);
    expect(stock.body.some((r: any) => r.batchId === batchId)).toBe(false); // qty back to 0 → filtered out

    // double reverse is rejected
    await request(app.getHttpServer())
      .post(`/api/receipts/${posted.body.id}/reverse`)
      .set(auth())
      .expect(409);
  });

  it('rejects a receipt into an archived location (422)', async () => {
    const loc = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `SI-Arch-${tag}` })
    ).body;
    await request(app.getHttpServer())
      .delete(`/api/storage-locations/${loc.id}`)
      .set(auth())
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId: loc.id,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `X-${tag}`, quantity: 1, unitCost: 1, currencyId }],
      })
      .expect(422);
  });
});
