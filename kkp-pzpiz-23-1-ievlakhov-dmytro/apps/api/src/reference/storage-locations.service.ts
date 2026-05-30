import { ErrorCode } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppException } from '../common/api-exception';
import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';
import { StockLevelEntity } from '../entities/stock-level.entity';
import { StorageLocationEntity } from '../entities/storage-location.entity';

@Injectable()
export class StorageLocationsService extends SoftDeleteCrudService<StorageLocationEntity> {
  constructor(
    @InjectRepository(StorageLocationEntity) repo: Repository<StorageLocationEntity>,
    @InjectRepository(StockLevelEntity) private readonly stock: Repository<StockLevelEntity>,
  ) {
    super(repo, 'StorageLocation');
  }

  protected async assertArchivable(location: StorageLocationEntity): Promise<void> {
    const withStock = await this.stock
      .createQueryBuilder('s')
      .where('s.location_id = :id', { id: location.id })
      .andWhere('s.quantity > 0')
      .getCount();
    if (withStock > 0) {
      throw new AppException(ErrorCode.CONFLICT, 'Location still holds stock', {
        positions: withStock,
      });
    }
  }
}
