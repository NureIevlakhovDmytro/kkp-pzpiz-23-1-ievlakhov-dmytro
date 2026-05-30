import { ErrorCode, Role } from '@app/shared';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, JwtUser, Roles } from '../../core/auth/decorators';
import { AppException } from '../../core/common/api-exception';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { UsersService } from '../../core/users/users.service';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from './dto/user.dto';

@ApiTags('admin-users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/users')
export class UserManagementController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query() page: PaginationQueryDto, @Query() f: UserFilterDto) {
    return this.users.listUsers(page, f.role, f.isActive);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.users.toDto(await this.users.getUser(id));
  }

  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.users.toDto(await this.users.createUser(body));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.users.toDto(await this.users.adminUpdate(id, body));
  }

  @Delete(':id')
  async anonymize(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    if (id === actor.id) {
      throw new AppException(ErrorCode.BUSINESS_RULE, 'Use /me to erase your own account');
    }
    await this.users.anonymize(id);
    return { status: 'anonymized' };
  }
}
