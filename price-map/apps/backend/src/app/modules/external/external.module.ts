import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ExternalService } from './services';
import { ExternalGateway } from './gateways';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import {Channel, connect, Connection, ConsumeMessage}from 'amqplib'

/**
 * Модуль для взаимодействия с внешними системами (OSRM, OSM API)
 * @export
 * @class ExternalModule
 */
@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    ExternalService,
    ExternalGateway,
    JwtService
  ],
})
export class ExternalModule implements OnModuleInit {
  public async onModuleInit() {
    const connection: Connection = await connect(
      'amqp://guest:guest@localhost:5672'
      )
      
      const channel: Channel = await connection.createChannel();
      
      await channel.assertQueue('test_queue');

      await channel.consume('test_queue', (msg: ConsumeMessage ) => {
        Logger.debug(`Message is ${msg.content.toString()}`);
        console.log(JSON.parse(msg.content.toString()))
        channel.ack(msg);
      })
  }
}
