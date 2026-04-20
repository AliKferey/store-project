import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    // 1. Reject duplicate emails
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    // 2. Create user — password is plain here, @BeforeInsert hashes it
    const user = this.userRepo.create({ ...dto, role: UserRole.USER });
    const saved = await this.userRepo.save(user);

    // 3. Generate tokens and store refresh token hash
    const tokens = await this.generateTokens(saved);
    await this.saveRefreshToken(saved.id, tokens.refreshToken);

    return { ...tokens, user: this.sanitize(saved) };
  }

  async signIn(dto: SignInDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    // Same error for "not found" AND "wrong password" — don't reveal which
    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { ...tokens, user: this.sanitize(user) };
  }

  async signOut(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
    // Nulling the refresh token means future refresh attempts fail
    return { message: 'Signed out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.sanitize(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'), // '15m'
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'), // '7d'
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    // Store a HASH — if DB is leaked, tokens still can't be reused
    const hash = await bcrypt.hash(token, 10);
    await this.userRepo.update(userId, { refreshToken: hash });
  }

  private sanitize(user: User) {
    const { password, refreshToken, ...safe } = user;
    return safe; // never return the password hash or token to the client
  }
  async refreshTokens(userId: string, incomingToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const matches = await bcrypt.compare(incomingToken, user.refreshToken);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
