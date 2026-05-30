import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettingsEntity {
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number;

  @Column({ name: 'near_expiry_days', type: 'int', default: 3 })
  nearExpiryDays: number;

  @Column({ name: 'low_stock_check_enabled', default: true })
  lowStockCheckEnabled: boolean;

  @Column({ name: 'near_expiry_check_enabled', default: true })
  nearExpiryCheckEnabled: boolean;

  @Column({ name: 'base_currency_id', type: 'uuid' })
  baseCurrencyId: string;

  @Column({ name: 'backup_schedule', type: 'varchar', nullable: true })
  backupSchedule: string | null;
}
