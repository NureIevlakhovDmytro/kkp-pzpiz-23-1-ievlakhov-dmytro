import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/product.entity';
import { CategoryEntity } from '../entities/category.entity';
import { UnitEntity } from '../entities/unit.entity';
import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';
import { AppException } from '../common/api-exception';
import { ErrorCode } from '@app/shared';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService extends SoftDeleteCrudService<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity) repo: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(UnitEntity) private readonly units: Repository<UnitEntity>,
  ) {
    super(repo, 'Product');
  }

  async createProduct(dto: CreateProductDto): Promise<ProductEntity> {
    await this.assertActiveUnit(dto.unitId);
    if (dto.categoryId) await this.assertActiveCategory(dto.categoryId);
    return this.create({
      name: dto.name,
      sku: dto.sku ?? null,
      categoryId: dto.categoryId ?? null,
      unitId: dto.unitId,
      minStock: dto.minStock ?? 0,
      shelfLifeDays: dto.shelfLifeDays ?? null,
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    if (dto.categoryId) await this.assertActiveCategory(dto.categoryId);
    return this.update(id, dto);
  }

  private async assertActiveUnit(unitId: string): Promise<void> {
    const u = await this.units.findOne({ where: { id: unitId } });
    if (!u) throw new AppException(ErrorCode.NOT_FOUND, 'Unit not found');
    if (!u.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Unit is archived');
  }

  private async assertActiveCategory(categoryId: string): Promise<void> {
    const c = await this.categories.findOne({ where: { id: categoryId } });
    if (!c) throw new AppException(ErrorCode.NOT_FOUND, 'Category not found');
    if (!c.isActive) throw new AppException(ErrorCode.BUSINESS_RULE, 'Category is archived');
  }
}
