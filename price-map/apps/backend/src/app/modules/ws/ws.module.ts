import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category3Level, Category2Level, Category1Level } from '@price-map/core/entities';
import { WsGateway } from './gateways/event.gateway';

// Пример работы с базой
@Module({
  imports: [TypeOrmModule.forFeature([
    Category3Level,
    Category2Level,
    Category1Level
  ], 'postgresConnect')],
  providers: [WsGateway]
})
export class WsModule {}
