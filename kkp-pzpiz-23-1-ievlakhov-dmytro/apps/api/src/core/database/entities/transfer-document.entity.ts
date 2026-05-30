import { DocumentStatus } from '@app/shared';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { TransferLineEntity } from './transfer-line.entity';

@Entity('transfer_documents')
export class TransferDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ name: 'from_location_id', type: 'uuid' })
  fromLocationId: string;

  @Column({ name: 'to_location_id', type: 'uuid' })
  toLocationId: string;

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

  @OneToMany(() => TransferLineEntity, (line) => line.transfer)
  lines: TransferLineEntity[];
}
