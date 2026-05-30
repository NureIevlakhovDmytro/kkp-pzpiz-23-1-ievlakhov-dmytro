import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';
import { ReceiptDocumentEntity } from './receipt-document.entity';

@Entity('receipt_lines')
export class ReceiptLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_id', type: 'uuid' })
  receiptId: string;

  @ManyToOne(() => ReceiptDocumentEntity, (doc) => doc.lines)
  @JoinColumn({ name: 'receipt_id' })
  receipt: ReceiptDocumentEntity;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ name: 'batch_number' })
  batchNumber: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: string | null;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 3,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

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
}
