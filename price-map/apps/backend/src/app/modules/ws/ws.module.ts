import { Module } from "@nestjs/common";
import { WsGateway } from "./gateways/event.gateway";

@Module({
  providers: [WsGateway]
})
export class WsModule {}
