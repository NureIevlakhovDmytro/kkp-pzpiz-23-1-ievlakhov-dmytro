import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitEntity } from '../entities/unit.entity';
import { ProductEntity } from '../entities/product.entity';
import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';
import { AppException } from '../common/api-exception';
import { ErrorCode } from '@app/shared';

@Injectable()
export class UnitsService extends SoftDeleteCrudService<UnitEntity> {
  constructor(
    @InjectRepository(UnitEntity) repo: Repository<UnitEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
  ) {
    super(repo, 'Unit');
  }

  protected async assertArchivable(e: UnitEntity): Promise<void> {
    const count = await this.products.count({ where: { unitId: e.id, isActive: true } });
    if (count > 0) throw new AppException(ErrorCode.CONFLICT, 'Unit is used by active products', { products: count });
  }
}
