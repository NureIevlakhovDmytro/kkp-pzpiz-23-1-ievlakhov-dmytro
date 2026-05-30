import { DocumentStatus } from '@app/shared';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ReceiptLineEntity } from './receipt-line.entity';

@Entity('receipt_documents')
export class ReceiptDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.POSTED })
  status: DocumentStatus;

  @Column({ name: 'reverses_id', type: 'uuid', nullable: true })
  reversesId: string | null;

  @Column({ name: 'client_uuid', type: 'varchar', nullable: true, unique: true })
  clientUuid: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => ReceiptLineEntity, (line) => line.receipt, { cascade: false })
  lines: ReceiptLineEntity[];
}
