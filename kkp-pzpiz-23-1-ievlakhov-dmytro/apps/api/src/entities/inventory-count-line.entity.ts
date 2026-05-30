import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';
import { InventoryCountEntity } from './inventory-count.entity';

@Entity('inventory_count_lines')
export class InventoryCountLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_id', type: 'uuid' })
  inventoryId: string;

  @ManyToOne(() => InventoryCountEntity, (inv) => inv.lines)
  @JoinColumn({ name: 'inventory_id' })
  inventory: InventoryCountEntity;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ name: 'expected_qty', type: 'numeric', precision: 14, scale: 3, transformer: new ColumnNumericTransformer() })
  expectedQty: number;

  @Column({
    name: 'actual_qty',
    type: 'numeric',
    precision: 14,
    scale: 3,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  actualQty: number | null;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  discrepancy: number | null;
}
