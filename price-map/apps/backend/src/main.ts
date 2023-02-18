import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const globalPrefix: string = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port: number | string = process.env.PORT || 3333;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://quest:quest@localhost:5672'],
      queue: 'test_exchange',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(port);
  
  Logger.log(
    `Server is running on: http://localhost:${port}/${globalPrefix}`,
    'bootstrap'
  );
}

bootstrap();
