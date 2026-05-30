import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currencies')
export class CurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  symbol: string | null;
}
