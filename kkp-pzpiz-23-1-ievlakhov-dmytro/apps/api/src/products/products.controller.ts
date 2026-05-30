import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@app/shared';
import { Roles } from '../auth/decorators';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { IncludeInactiveQuery } from '../common/crud/dto/reference.dto';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

class ProductFilter extends IncludeInactiveQuery {
  @IsOptional() @IsUUID() categoryId?: string;
}

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: ProductFilter) {
    return this.svc.list(page, f.includeInactive);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateProductDto) {
    return this.svc.createProduct(body);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.svc.updateProduct(id, body);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async archive(@Param('id') id: string) {
    await this.svc.archive(id);
    return { status: 'archived' };
  }
}
