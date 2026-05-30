import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@app/shared';
import { Roles } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IncludeInactiveQuery } from '../common/crud/dto/reference.dto';
import { SuppliersService } from './suppliers.service';

class CreateSupplierDto {
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsString() contactInfo?: string;
}
class UpdateSupplierDto {
  @IsOptional() @IsString() @MinLength(1) name?: string;
  @IsOptional() @IsString() contactInfo?: string;
}

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly svc: SuppliersService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() inc: IncludeInactiveQuery) {
    return this.svc.list(page, inc.includeInactive);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateSupplierDto) {
    return this.svc.create({ name: body.name, contactInfo: body.contactInfo ?? null });
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateSupplierDto) {
    return this.svc.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async archive(@Param('id') id: string) {
    await this.svc.archive(id);
    return { status: 'archived' };
  }
}
