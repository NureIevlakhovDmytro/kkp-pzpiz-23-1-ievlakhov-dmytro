import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { loadConfig } from '../config/env';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const cfg = loadConfig();
        return {
          type: 'postgres',
          host: cfg.db.host,
          port: cfg.db.port,
          username: cfg.db.user,
          password: cfg.db.password,
          database: cfg.db.database,
          autoLoadEntities: true,
          synchronize: false,
          migrationsRun: false,
        };
      },
    }),
  ],
})
export class PersistenceModule {}
