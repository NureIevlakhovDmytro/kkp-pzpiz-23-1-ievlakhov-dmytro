import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { loadConfig } from '../config/env';
import { UserEntity } from '../database/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MeController } from './me.controller';
import { PasswordService } from './password.service';
import { AdminSeeder } from './seed-admin';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      useFactory: () => {
        const cfg = loadConfig();
        return { secret: cfg.jwt.secret, signOptions: { expiresIn: cfg.jwt.expiresIn } };
      },
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, JwtStrategy, AdminSeeder, PasswordService],
})
export class AuthModule {}
