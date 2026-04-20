import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // isGlobal:true → no need to import ConfigModule in every sub-module

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        schema: 'store',
        entities: [User],
        synchronize: true, // auto-creates tables in dev — use migrations in prod!
        logging: true,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // APP_GUARD applies JwtAuthGuard to EVERY route globally.
    // Mark public routes with @Public() to opt out.

    { provide: APP_GUARD, useClass: RolesGuard },
    // RolesGuard runs after JwtAuthGuard — checks @Roles() on routes
  ],
})
export class AppModule {}
