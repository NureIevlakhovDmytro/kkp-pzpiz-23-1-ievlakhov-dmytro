import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../../core/common/api-exception';
import { SoftDeleteCrudService } from '../../core/common/crud/soft-delete.service';
import { CategoryEntity } from '../../core/database/entities/category.entity';
import { ProductEntity } from '../../core/database/entities/product.entity';

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
    if (count > 0)
      throw new AppException(ErrorCode.CONFLICT, 'Category is used by active products', {
        products: count,
      });
  }
}
