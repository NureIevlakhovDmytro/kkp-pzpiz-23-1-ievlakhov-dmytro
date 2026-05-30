import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { StockAdjustmentLineEntity } from './stock-adjustment-line.entity';

@Entity('stock_adjustments')
export class StockAdjustmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'inventory_id', type: 'uuid', unique: true })
  inventoryId: string;

  @Column({ type: 'varchar', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => StockAdjustmentLineEntity, (line) => line.adjustment)
  lines: StockAdjustmentLineEntity[];
}
