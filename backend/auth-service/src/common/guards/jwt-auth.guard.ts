import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is marked @Public() — if so, skip JWT entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // method-level decorator checked first
      context.getClass(), // then class-level decorator
    ]);
    if (isPublic) return true;
    return super.canActivate(context); // triggers JwtStrategy.validate()
  }

  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException('Login required');
    return user; // becomes req.user
  }
}
