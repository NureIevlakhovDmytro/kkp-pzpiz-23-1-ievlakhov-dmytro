export interface AppConfig {
  apiPort: number;
  webOrigin: string;
  db: { host: string; port: number; user: string; password: string; database: string };
  jwt: { secret: string; expiresIn: string };
  admin: { email: string; password: string; name: string };
}

export function loadConfig(): AppConfig {
  const required = (k: string): string => {
    const v = process.env[k];
    if (!v) throw new Error(`Missing required env var: ${k}`);
    return v;
  };
  return {
    apiPort: Number(process.env.API_PORT ?? 3000),
    webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3001',
    db: {
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      user: required('POSTGRES_USER'),
      password: required('POSTGRES_PASSWORD'),
      database: required('POSTGRES_DB'),
    },
    jwt: { secret: required('JWT_SECRET'), expiresIn: process.env.JWT_EXPIRES_IN ?? '900s' },
    admin: {
      email: process.env.ADMIN_EMAIL ?? 'admin@warehouse.local',
      password: process.env.ADMIN_PASSWORD ?? 'Admin12345!',
      name: process.env.ADMIN_NAME ?? 'System Administrator',
    },
  };
}
