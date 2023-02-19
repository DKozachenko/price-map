import { switchMap } from 'rxjs';
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ExternalService } from './services';
import { ExternalGateway } from './gateways';
import { HttpModule } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import {Channel, connect, Connection, ConsumeMessage}from 'amqplib';
import { RabbitService } from '../../services';

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
    RabbitService,
    ExternalService,
    ExternalGateway,
    JwtService
  ],
})
export class ExternalModule implements OnModuleInit {
  constructor(private readonly rabbitService: RabbitService) {}

  public onModuleInit() {
    Logger.debug(123, this.rabbitService.connected$)
    this.rabbitService.connected$.subscribe(d => Logger.debug(12321321))
    // this.rabbitService.connected$
    //   .pipe(
    //     switchMap((data: boolean) => {
    //       console.log(123)
    //       if (data) {
    //         return this.rabbitService.getMessage<any>('test_queue');
    //       }
    //     })
    //   )
    //   .subscribe(data => {
    //     Logger.debug(data)
    //   });
  }
}
