import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../entities/category.entity';
import { ProductEntity } from '../entities/product.entity';
import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';
import { AppException } from '../common/api-exception';
import { ErrorCode } from '@app/shared';

@Injectable()
export class CategoriesService extends SoftDeleteCrudService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity) repo: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
  ) {
    super(repo, 'Category');
  }

  protected async assertArchivable(e: CategoryEntity): Promise<void> {
    const count = await this.products.count({ where: { categoryId: e.id, isActive: true } });
    if (count > 0) throw new AppException(ErrorCode.CONFLICT, 'Category is used by active products', { products: count });
  }
}
