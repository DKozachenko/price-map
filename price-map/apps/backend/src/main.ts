import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls:['amqp://localhost:5672'],
      queue: 'test_queue',
      queueOptions: {
        durable: false
      }
    }
  })
  await app.listen();
  // Logger.log(
  //   `Server is running on: http://localhost:${port}/${globalPrefix}`,
  //   'bootstrap'
  // );
}

bootstrap();
