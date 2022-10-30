import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from "@nestjs/common";
import { WsGateway } from "./gateways/event.gateway";
import { BaseEntity } from '../../models/test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BaseEntity])],
  providers: [WsGateway]
})
export class WsModule {}
