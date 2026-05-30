import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { UnitEntity } from '../entities/unit.entity';
import { ProductEntity } from '../entities/product.entity';
import { SupplierEntity } from '../entities/supplier.entity';
import { StorageLocationEntity } from '../entities/storage-location.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { StorageLocationsService } from './storage-locations.service';
import { StorageLocationsController } from './storage-locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, UnitEntity, ProductEntity, SupplierEntity, StorageLocationEntity])],
  controllers: [CategoriesController, UnitsController, SuppliersController, StorageLocationsController],
  providers: [CategoriesService, UnitsService, SuppliersService, StorageLocationsService],
})
export class ReferenceModule {}
