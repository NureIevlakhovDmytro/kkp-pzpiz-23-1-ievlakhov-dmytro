import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from '../entities/supplier.entity';
import { SoftDeleteCrudService } from '../common/crud/soft-delete.service';

@Injectable()
export class SuppliersService extends SoftDeleteCrudService<SupplierEntity> {
  constructor(@InjectRepository(SupplierEntity) repo: Repository<SupplierEntity>) {
    super(repo, 'Supplier');
  }
}
