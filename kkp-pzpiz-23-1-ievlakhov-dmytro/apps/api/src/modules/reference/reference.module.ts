import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryEntity } from '../../core/database/entities/category.entity';
import { ProductEntity } from '../../core/database/entities/product.entity';
import { StockLevelEntity } from '../../core/database/entities/stock-level.entity';
import { StorageLocationEntity } from '../../core/database/entities/storage-location.entity';
import { SupplierEntity } from '../../core/database/entities/supplier.entity';
import { UnitEntity } from '../../core/database/entities/unit.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { StorageLocationsController } from './storage-locations.controller';
import { StorageLocationsService } from './storage-locations.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      UnitEntity,
      ProductEntity,
      SupplierEntity,
      StorageLocationEntity,
      StockLevelEntity,
    ]),
  ],
  controllers: [
    CategoriesController,
    UnitsController,
    SuppliersController,
    StorageLocationsController,
  ],
  providers: [CategoriesService, UnitsService, SuppliersService, StorageLocationsService],
})
export class ReferenceModule {}
