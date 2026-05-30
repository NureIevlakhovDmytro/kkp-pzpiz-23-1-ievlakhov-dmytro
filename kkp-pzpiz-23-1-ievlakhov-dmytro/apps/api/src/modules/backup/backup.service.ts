import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';

import { AppException } from '../../core/common/api-exception';
import { loadConfig } from '../../core/config/env';

export interface BackupResult {
  file: string;
  sizeBytes: number;
  createdAt: string;
}

@Injectable()
export class BackupService {
  /** Run pg_dump to a plain-SQL file in ./backups. Restore is a manual runbook (see README) — never exposed via API. */
  async createBackup(): Promise<BackupResult> {
    const cfg = loadConfig();
    const dir = join(process.cwd(), 'backups');
    await mkdir(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = join(dir, `backup-${stamp}.sql`);

    await new Promise<void>((resolve, reject) => {
      // spawn with an argument array (no shell) — no command-injection surface; args come from server config.
      const child = spawn(
        'pg_dump',
        [
          '-h',
          cfg.db.host,
          '-p',
          String(cfg.db.port),
          '-U',
          cfg.db.user,
          '-d',
          cfg.db.database,
          '-F',
          'p',
          '-f',
          file,
        ],
        { env: { ...process.env, PGPASSWORD: cfg.db.password } },
      );
      let stderr = '';
      child.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
      child.on('error', (err) =>
        reject(new AppException(ErrorCode.INTERNAL, `pg_dump unavailable: ${err.message}`)),
      );
      child.on('close', (code) =>
        code === 0
          ? resolve()
          : reject(new AppException(ErrorCode.INTERNAL, `pg_dump failed (${code}): ${stderr}`)),
      );
    });

    const info = await stat(file);
    return { file, sizeBytes: info.size, createdAt: new Date().toISOString() };
  }
}
