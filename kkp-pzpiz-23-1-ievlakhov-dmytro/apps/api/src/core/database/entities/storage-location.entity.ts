import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('storage_locations')
export class StorageLocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
