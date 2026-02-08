import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('InnoBusiness ERP API')
    .setDescription('MVP ERP API with tenant-aware CRUD endpoints.')
    .setVersion('0.1.0')
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header' },
      'tenant-id',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

bootstrap();
