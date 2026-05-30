import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('units')
export class UnitEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() code: string;
  @Column() name: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
}
