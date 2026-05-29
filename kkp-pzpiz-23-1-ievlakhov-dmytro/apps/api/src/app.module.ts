import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { PersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule, PersistenceModule],
})
export class AppModule {}
