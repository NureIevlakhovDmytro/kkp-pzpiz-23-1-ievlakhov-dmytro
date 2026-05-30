import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';
import { SupplierEntity } from '../entities/supplier.entity';

@Injectable()
export class SuppliersService extends SoftDeleteCrudService<SupplierEntity> {
  constructor(@InjectRepository(SupplierEntity) repo: Repository<SupplierEntity>) {
    super(repo, 'Supplier');
  }
}
