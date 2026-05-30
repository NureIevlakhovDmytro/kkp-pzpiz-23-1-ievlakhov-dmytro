import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';
import { StorageLocationEntity } from '../entities/storage-location.entity';

@Injectable()
export class StorageLocationsService extends SoftDeleteCrudService<StorageLocationEntity> {
  constructor(@InjectRepository(StorageLocationEntity) repo: Repository<StorageLocationEntity>) {
    super(repo, 'StorageLocation');
  }
}
