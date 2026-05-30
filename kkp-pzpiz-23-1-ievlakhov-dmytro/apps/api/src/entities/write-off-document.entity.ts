import { DocumentStatus } from '@app/shared';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { WriteOffLineEntity } from './write-off-line.entity';

@Entity('write_off_documents')
export class WriteOffDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'reason_id', type: 'uuid' })
  reasonId: string;

  @Column({ type: 'varchar', nullable: true })
  comment: string | null;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.POSTED })
  status: DocumentStatus;

  @Column({ name: 'reverses_id', type: 'uuid', nullable: true })
  reversesId: string | null;

  @Column({ name: 'client_uuid', type: 'varchar', nullable: true, unique: true })
  clientUuid: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => WriteOffLineEntity, (line) => line.writeOff)
  lines: WriteOffLineEntity[];
}
