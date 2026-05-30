import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';

@Entity('stock_levels')
export class StockLevelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @VersionColumn()
  version: number;
}
