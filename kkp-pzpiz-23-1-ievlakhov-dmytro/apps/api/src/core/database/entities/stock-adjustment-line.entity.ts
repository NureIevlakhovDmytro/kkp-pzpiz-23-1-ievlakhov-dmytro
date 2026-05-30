import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';
import { StockAdjustmentEntity } from './stock-adjustment.entity';

@Entity('stock_adjustment_lines')
export class StockAdjustmentLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'adjustment_id', type: 'uuid' })
  adjustmentId: string;

  @ManyToOne(() => StockAdjustmentEntity, (adj) => adj.lines)
  @JoinColumn({ name: 'adjustment_id' })
  adjustment: StockAdjustmentEntity;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ type: 'numeric', precision: 14, scale: 3, transformer: new ColumnNumericTransformer() })
  delta: number;

  @Column({ name: 'reason_id', type: 'uuid', nullable: true })
  reasonId: string | null;
}
