import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  // All routes become /api/auth/signup etc.

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // strips unknown fields — prevents attackers sending extra data

      forbidNonWhitelisted: true,
      // returns 400 if unknown fields are sent (stricter than whitelist alone)

      transform: true,
      // auto-converts "123" → 123 for number fields
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Sign up, sign in, token refresh')
    .setVersion('1.0')
    .addBearerAuth() // adds "Authorize" button to Swagger UI
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(process.env.PORT || 3001);
  console.log('Auth service: http://localhost:3001');
  console.log('Swagger docs: http://localhost:3001/api/docs');
}
bootstrap();
