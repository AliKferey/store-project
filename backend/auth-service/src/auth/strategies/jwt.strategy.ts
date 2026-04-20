import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface JwtPayload {
  sub: string; // user UUID — "sub" is the JWT standard field for subject
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Looks for "Authorization: Bearer <token>" on every request

      ignoreExpiration: false,
      // Expired token → 401 automatically

      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      // Must match the secret used when the token was signed
    });
  }

  async validate(payload: JwtPayload) {
    // Called only AFTER the signature is verified successfully
    // We re-check the DB so deleted users can't keep using old tokens
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User no longer exists');

    // Whatever you return here becomes req.user in your route handlers
    return { id: user.id, email: user.email, role: user.role };
  }
}
