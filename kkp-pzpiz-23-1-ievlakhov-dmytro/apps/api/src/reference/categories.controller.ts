import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@app/shared';
import { Roles } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateNamedDto, IncludeInactiveQuery, UpdateNamedDto } from '../common/crud/dto/reference.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

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
  create(@Body() body: CreateNamedDto) {
    return this.svc.create({ name: body.name });
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateNamedDto) {
    return this.svc.update(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async archive(@Param('id') id: string) {
    await this.svc.archive(id);
    return { status: 'archived' };
  }
}
