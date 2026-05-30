import type { INestApplication } from '@nestjs/common';
const request = require('supertest');

import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

describe('Transfers (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let unitId: string;
  let productId: string;
  let fromId: string;
  let toId: string;
  let currencyId: string;
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
        .send({ code: `tr${tag}`, name: 'kg' })
    ).body.id;
    productId = (
      await request(app.getHttpServer())
        .post('/api/products')
        .set(auth())
        .send({ name: `TR-Prod-${tag}`, unitId })
    ).body.id;
    fromId = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `TR-From-${tag}` })
    ).body.id;
    toId = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `TR-To-${tag}` })
    ).body.id;
    currencyId = (
      await request(app.getHttpServer()).get('/api/currencies').set(auth())
    ).body.items.find((c: any) => c.code === 'UAH').id;
    const receipt = await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId: fromId,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `TRB-${tag}`, quantity: 50, unitCost: 10, currencyId }],
      });
    batchId = receipt.body.lines[0].batchId;
  });
  afterAll(async () => {
    await app.close();
  });

  const stockAt = async (locationId: string) =>
    (
      await request(app.getHttpServer()).get(`/api/stock?locationId=${locationId}`).set(auth())
    ).body.find((r: any) => r.batchId === batchId)?.quantity ?? 0;

  it('moves stock from source to destination', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/transfers')
      .set(auth())
      .send({
        fromLocationId: fromId,
        toLocationId: toId,
        date: '2026-05-30',
        lines: [{ batchId, quantity: 20 }],
      })
      .expect(201);
    expect(res.body.number).toMatch(/^TRF-\d{6}$/);
    expect(await stockAt(fromId)).toBe(30);
    expect(await stockAt(toId)).toBe(20);
  });

  it('rejects from === to (400)', async () => {
    await request(app.getHttpServer())
      .post('/api/transfers')
      .set(auth())
      .send({
        fromLocationId: fromId,
        toLocationId: fromId,
        date: '2026-05-30',
        lines: [{ batchId, quantity: 1 }],
      })
      .expect(400);
  });

  it('rejects moving more than is at the source (409)', async () => {
    await request(app.getHttpServer())
      .post('/api/transfers')
      .set(auth())
      .send({
        fromLocationId: fromId,
        toLocationId: toId,
        date: '2026-05-30',
        lines: [{ batchId, quantity: 9999 }],
      })
      .expect(409);
  });

  it('reverses a transfer, moving stock back', async () => {
    const posted = await request(app.getHttpServer())
      .post('/api/transfers')
      .set(auth())
      .send({
        fromLocationId: fromId,
        toLocationId: toId,
        date: '2026-05-30',
        lines: [{ batchId, quantity: 10 }],
      })
      .expect(201);
    const fromBefore = await stockAt(fromId);
    const rev = await request(app.getHttpServer())
      .post(`/api/transfers/${posted.body.id}/reverse`)
      .set(auth())
      .expect(201);
    expect(rev.body.reversesId).toBe(posted.body.id);
    expect(await stockAt(fromId)).toBe(fromBefore + 10);
    await request(app.getHttpServer())
      .post(`/api/transfers/${posted.body.id}/reverse`)
      .set(auth())
      .expect(409);
  });
});
