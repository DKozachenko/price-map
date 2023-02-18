import { Module } from '@nestjs/common';
import { ExternalService, RabbitService } from './services';
import { ExternalGateway } from './gateways';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

/**
 * Модуль для взаимодействия с внешними системами (OSRM, OSM API)
 * @export
 * @class ExternalModule
 */
@Module({
  imports: [
    HttpModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'test_exchange',
          type: 'fanout',
        },
      ],
      uri: 'amqp://guest:guest@localhost:5672'
    }),
  ],
  providers: [
    RabbitService,
    ExternalService,
    ExternalGateway,
    JwtService
  ],
})
export class ExternalModule {}
