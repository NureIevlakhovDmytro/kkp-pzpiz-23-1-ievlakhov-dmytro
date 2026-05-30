import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { UnitEntity } from '../entities/unit.entity';
import { ProductEntity } from '../entities/product.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryEntity, UnitEntity, ProductEntity])],
  controllers: [CategoriesController, UnitsController],
  providers: [CategoriesService, UnitsService],
})
export class ReferenceModule {}
