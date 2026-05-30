import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { NotificationService } from '../src/modules/notifications/notification.service';
import { bootstrapTestApp } from './helpers';

describe('Notifications ★ checks (e2e)', () => {
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
        .send({ code: `nt${tag}`, name: 'kg' })
    ).body.id;
    // min_stock 100, but we will receive only 10 -> low stock
    productId = (
      await request(app.getHttpServer())
        .post('/api/products')
        .set(auth())
        .send({ name: `NT-Prod-${tag}`, unitId, minStock: 100 })
    ).body.id;
    locationId = (
      await request(app.getHttpServer())
        .post('/api/storage-locations')
        .set(auth())
        .send({ name: `NT-Loc-${tag}` })
    ).body.id;
    currencyId = (
      await request(app.getHttpServer()).get('/api/currencies').set(auth())
    ).body.items.find((c: { code: string; id: string }) => c.code === 'UAH').id;
    await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `NTB-${tag}`, quantity: 10, unitCost: 5, currencyId }],
      });
  });

  afterAll(async () => {
    await app.close();
  });

  const runChecks = () => app.get(NotificationService).runChecks();

  it('creates a LOW_STOCK notification for a product below min_stock', async () => {
    await runChecks();
    const res = await request(app.getHttpServer())
      .get('/api/notifications?type=LOW_STOCK')
      .set(auth())
      .expect(200);
    const mine = res.body.items.find((n: { productId: string }) => n.productId === productId);
    expect(mine).toBeDefined();
    expect(mine.payload.minStock).toBe(100);
  });

  it('deduplicates: a second run does not create a duplicate active notification', async () => {
    const countMine = async () =>
      (
        await request(app.getHttpServer())
          .get('/api/notifications?type=LOW_STOCK&limit=200')
          .set(auth())
      ).body.items.filter(
        (n: { productId: string; resolvedAt: string | null; isRead: boolean }) =>
          n.productId === productId && !n.resolvedAt && !n.isRead,
      ).length;
    const before = await countMine();
    await runChecks();
    expect(await countMine()).toBe(before); // still exactly one active
  });

  it('auto-resolves when stock is replenished above min_stock', async () => {
    await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId,
        date: '2026-05-30',
        lines: [{ productId, batchNumber: `NTB2-${tag}`, quantity: 200, unitCost: 5, currencyId }],
      });
    await runChecks();
    const res = await request(app.getHttpServer())
      .get('/api/notifications?type=LOW_STOCK&limit=200')
      .set(auth());
    const active = res.body.items.find(
      (n: { productId: string; resolvedAt: string | null; isRead: boolean }) =>
        n.productId === productId && !n.resolvedAt && !n.isRead,
    );
    expect(active).toBeUndefined(); // resolved
  });

  it('marks a notification read', async () => {
    // create a fresh low-stock product to get an unread notification
    const p2 = (
      await request(app.getHttpServer())
        .post('/api/products')
        .set(auth())
        .send({ name: `NT-Prod2-${tag}`, unitId, minStock: 50 })
    ).body.id;
    await request(app.getHttpServer())
      .post('/api/receipts')
      .set(auth())
      .send({
        locationId,
        date: '2026-05-30',
        lines: [
          { productId: p2, batchNumber: `NTB3-${tag}`, quantity: 1, unitCost: 5, currencyId },
        ],
      });
    await runChecks();
    const n = (
      await request(app.getHttpServer())
        .get('/api/notifications?type=LOW_STOCK&limit=200')
        .set(auth())
    ).body.items.find((x: { productId: string }) => x.productId === p2);
    const read = await request(app.getHttpServer())
      .patch(`/api/notifications/${n.id}/read`)
      .set(auth())
      .expect(200);
    expect(read.body.isRead).toBe(true);
  });
});
