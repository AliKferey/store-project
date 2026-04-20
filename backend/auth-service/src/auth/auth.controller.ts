import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

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
