import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ColumnNumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('exchange_rates')
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'currency_id' })
  currencyId: string;

  @Column({
    name: 'rate_to_base',
    type: 'numeric',
    precision: 18,
    scale: 6,
    transformer: new ColumnNumericTransformer(),
  })
  rateToBase: number;

  @Column({ name: 'effective_date', type: 'date' })
  effectiveDate: string;
}
