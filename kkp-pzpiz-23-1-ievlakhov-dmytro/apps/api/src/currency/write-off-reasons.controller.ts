import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WriteOffReasonEntity } from '../entities/write-off-reason.entity';

@ApiTags('write-off-reasons')
@ApiBearerAuth()
@Controller('write-off-reasons')
export class WriteOffReasonsController {
  constructor(@InjectRepository(WriteOffReasonEntity) private readonly repo: Repository<WriteOffReasonEntity>) {}

  @Get()
  list() {
    return this.repo.find({ order: { code: 'ASC' } });
  }
}
