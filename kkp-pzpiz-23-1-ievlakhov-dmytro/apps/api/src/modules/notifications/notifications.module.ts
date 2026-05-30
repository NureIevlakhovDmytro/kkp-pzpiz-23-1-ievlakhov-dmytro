import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppSettingsEntity } from '../../core/database/entities/app-settings.entity';
import { NotificationEntity } from '../../core/database/entities/notification.entity';
import { StockModule } from '../stock/stock.module';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity, AppSettingsEntity]), StockModule],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
