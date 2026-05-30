import { InventoryStatus } from '@app/shared';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { InventoryCountLineEntity } from './inventory-count-line.entity';

@Entity('inventory_counts')
export class InventoryCountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.DRAFT })
  status: InventoryStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => InventoryCountLineEntity, (line) => line.inventory)
  lines: InventoryCountLineEntity[];
}
