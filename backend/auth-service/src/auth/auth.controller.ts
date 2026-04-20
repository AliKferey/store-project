import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  @Post('signup')
  @Public() // no token needed — anyone can register
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new account' })
  signUp(@Body() dto: SignUpDto) {
    return this.auth.signUp(dto);
    // @Body() extracts + validates the JSON body against SignUpDto
    // If validation fails, NestJS returns 400 before this line runs
  }

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in, get JWT tokens' })
  signIn(@Body() dto: SignInDto) {
    return this.auth.signIn(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token');
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.auth.refreshTokens(payload.sub, refreshToken);
  }

  @Post('signout')
  @ApiBearerAuth() // requires JWT — shows lock in Swagger
  @ApiOperation({ summary: 'Sign out, invalidate refresh token' })
  signOut(@CurrentUser('id') userId: string) {
    return this.auth.signOut(userId);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.auth.getProfile(userId);
  }
}
