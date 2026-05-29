import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadConfig } from '../config/env';
import { JwtUser } from './decorators';
import { Role } from '@app/shared';

interface JwtPayload { sub: string; email: string; role: Role }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: loadConfig().jwt.secret,
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
