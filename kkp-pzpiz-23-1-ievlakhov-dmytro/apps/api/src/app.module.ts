import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { RolesGuard } from './core/auth/roles.guard';
import { CommonModule } from './core/common/common.module';
import { PersistenceModule } from './core/database/persistence.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { ReferenceModule } from './modules/reference/reference.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SeedModule } from './modules/seed/seed.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StockModule } from './modules/stock/stock.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { WriteOffsModule } from './modules/write-offs/write-offs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    CommonModule,
    PersistenceModule,
    AuthModule,
    ReferenceModule,
    ProductsModule,
    CurrencyModule,
    SettingsModule,
    SeedModule,
    StockModule,
    ReceiptsModule,
    WriteOffsModule,
    InventoryModule,
    ReportsModule,
    TransfersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
