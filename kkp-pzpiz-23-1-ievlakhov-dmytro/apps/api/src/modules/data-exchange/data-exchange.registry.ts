import type { ExportEntity } from '@app/shared';
import type { EntityTarget, ObjectLiteral } from 'typeorm';

import { CategoryEntity } from '../../core/database/entities/category.entity';
import { CurrencyEntity } from '../../core/database/entities/currency.entity';
import { StorageLocationEntity } from '../../core/database/entities/storage-location.entity';
import { SupplierEntity } from '../../core/database/entities/supplier.entity';
import { UnitEntity } from '../../core/database/entities/unit.entity';

export interface EntitySpec {
  entity: EntityTarget<ObjectLiteral>;
  naturalKey: string;
  fields: string[];
}

export const EXPORT_REGISTRY: Record<ExportEntity, EntitySpec> = {
  categories: { entity: CategoryEntity, naturalKey: 'name', fields: ['name', 'isActive'] },
  units: { entity: UnitEntity, naturalKey: 'code', fields: ['code', 'name', 'isActive'] },
  suppliers: {
    entity: SupplierEntity,
    naturalKey: 'name',
    fields: ['name', 'contactInfo', 'isActive'],
  },
  'storage-locations': {
    entity: StorageLocationEntity,
    naturalKey: 'name',
    fields: ['name', 'description', 'isActive'],
  },
  currencies: { entity: CurrencyEntity, naturalKey: 'code', fields: ['code', 'name', 'symbol'] },
};
