import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';

@Entity('batches')
export class BatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'batch_number' })
  batchNumber: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: string | null;

  @Column({ name: 'received_date', type: 'date' })
  receivedDate: string;

  @Column({
    name: 'unit_cost',
    type: 'numeric',
    precision: 14,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  unitCost: number;

  @Column({ name: 'currency_id', type: 'uuid' })
  currencyId: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
