import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category3Level } from "@price-map/core/entities";
import { WsGateway } from "./gateways/event.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([Category3Level], 'postgresConnect')],
  providers: [WsGateway]
})
export class WsModule {}
