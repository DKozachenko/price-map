import { Module } from "@nestjs/common";
import { WsGateway } from "./gateways/event.gateway";

@Module({
  imports: [],
  providers: [WsGateway]
})
export class WsModule {}
