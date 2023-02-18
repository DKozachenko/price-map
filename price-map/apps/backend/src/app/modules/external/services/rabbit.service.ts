import { Nack, RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RabbitService {
  @RabbitRPC({
    exchange: 'test_exchange',
    routingKey: 'test',
    queue: 'test_queue',
  })
  public async rpcHandler(msg: {}) {
    return {
      response: 42,
    };
  }
}