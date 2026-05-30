import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

import type { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { loadConfig } from '../src/core/config/env';
import { bootstrapTestApp } from './helpers';

const pgDumpAvailable = (() => {
  const res = spawnSync('pg_dump', ['--version']);
  return !res.error && res.status === 0;
})();

describe('Backup /admin/backup (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const cfg = loadConfig();
  const tag = Date.now();

  beforeAll(async () => {
    app = await bootstrapTestApp();
    adminToken = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: cfg.admin.email, password: cfg.admin.password })
    ).body.token;
  });
  afterAll(async () => {
    await app.close();
  });

  it('a USER cannot trigger a backup (403)', async () => {
    const email = `bk-${tag}@test.local`;
    await request(app.getHttpServer())
      .post('/api/admin/users')
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ email, fullName: 'BK', password: 'Passw0rd!', role: 'USER' });
    const userToken = (
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email, password: 'Passw0rd!' })
    ).body.token;
    await request(app.getHttpServer())
      .post('/api/admin/backup')
      .set({ Authorization: `Bearer ${userToken}` })
      .expect(403);
  });

  (pgDumpAvailable ? it : it.skip)('ADMIN creates a pg_dump backup file', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/backup')
      .set({ Authorization: `Bearer ${adminToken}` })
      .expect(201);
    expect(res.body.sizeBytes).toBeGreaterThan(0);
    expect(existsSync(res.body.file)).toBe(true);
  });
});
