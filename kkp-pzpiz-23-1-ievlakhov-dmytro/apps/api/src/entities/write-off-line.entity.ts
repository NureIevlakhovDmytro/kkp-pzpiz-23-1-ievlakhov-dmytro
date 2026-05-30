import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';
import { WriteOffDocumentEntity } from './write-off-document.entity';

@Entity('write_off_lines')
export class WriteOffLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'write_off_id', type: 'uuid' })
  writeOffId: string;

  @ManyToOne(() => WriteOffDocumentEntity, (doc) => doc.lines)
  @JoinColumn({ name: 'write_off_id' })
  writeOff: WriteOffDocumentEntity;

  @Column({ name: 'batch_id', type: 'uuid' })
  batchId: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ type: 'numeric', precision: 14, scale: 3, transformer: new ColumnNumericTransformer() })
  quantity: number;
}
