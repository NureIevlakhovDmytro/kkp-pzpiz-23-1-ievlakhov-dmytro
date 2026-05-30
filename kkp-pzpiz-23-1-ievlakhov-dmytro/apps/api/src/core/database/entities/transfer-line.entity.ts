import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';
import { TransferDocumentEntity } from './transfer-document.entity';

@Entity('transfer_lines')
export class TransferLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_id', type: 'uuid' })
  transferId: string;

  @ManyToOne(() => TransferDocumentEntity, (doc) => doc.lines)
  @JoinColumn({ name: 'transfer_id' })
  transfer: TransferDocumentEntity;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ type: 'numeric', precision: 14, scale: 3, transformer: new ColumnNumericTransformer() })
  quantity: number;
}
