import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageLocationEntity } from '../entities/storage-location.entity';
import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';

@Injectable()
export class StorageLocationsService extends SoftDeleteCrudService<StorageLocationEntity> {
  constructor(@InjectRepository(StorageLocationEntity) repo: Repository<StorageLocationEntity>) {
    super(repo, 'StorageLocation');
  }
}
