import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '../common/transformers/numeric.transformer';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'varchar', nullable: true }) sku: string | null;
  @Column({ name: 'category_id', type: 'uuid', nullable: true }) categoryId: string | null;
  @Column({ name: 'unit_id', type: 'uuid' }) unitId: string;
  @Column({
    name: 'min_stock',
    type: 'numeric',
    precision: 14,
    scale: 3,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  minStock: number;
  @Column({ name: 'shelf_life_days', type: 'int', nullable: true }) shelfLifeDays: number | null;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
