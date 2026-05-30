import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@app/shared';
import { Roles } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IncludeInactiveQuery } from '../common/crud/dto/reference.dto';
import { UnitsService } from './units.service';

class CreateUnitDto {
  @IsString() @MinLength(1) code: string;
  @IsString() @MinLength(1) name: string;
}
class UpdateUnitDto {
  @IsOptional() @IsString() @MinLength(1) code?: string;
  @IsOptional() @IsString() @MinLength(1) name?: string;
}

@ApiTags('units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private readonly svc: UnitsService) {}

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
  create(@Body() body: CreateUnitDto) {
    return this.svc.create({ code: body.code, name: body.name });
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUnitDto) {
    return this.svc.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async archive(@Param('id') id: string) {
    await this.svc.archive(id);
    return { status: 'archived' };
  }
}
