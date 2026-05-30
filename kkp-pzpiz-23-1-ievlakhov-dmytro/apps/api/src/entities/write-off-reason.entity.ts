import { WriteOffReasonCode } from '@app/shared';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('write_off_reasons')
export class WriteOffReasonEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'enum', enum: WriteOffReasonCode, unique: true }) code: WriteOffReasonCode;
  @Column({ name: 'name_uk' }) nameUk: string;
  @Column({ name: 'name_en' }) nameEn: string;
}
