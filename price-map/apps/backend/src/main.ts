import { INestApplication, INestMicroservice, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const globalPrefix: string = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'],
      queue: 'test_queue',
      queueOptions: {
        durable: true
      }
    },
  });

  
  app.startAllMicroservices();
  const port: number | string = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `Server is running on: http://localhost:${port}/${globalPrefix}`,
    'bootstrap'
  );
}

bootstrap();
