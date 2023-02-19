import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const globalPrefix: string = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port: number | string = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `Server is running on: http://localhost:${port}/${globalPrefix}`,
    'bootstrap'
  );
}

bootstrap();
