import { Module } from '@nestjs/common';
import { ShopsService } from './services';
import { ShopsGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from '@core/entities';
import { JwtService } from '@nestjs/jwt';

/**
 * Модуль магазинов
 * @export
 * @class ShopsModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([Shop], 'postgresConnect')],
  providers: [
    JwtService,
    ShopsGateway,
    ShopsService,
  ],
  exports: [ShopsService]
})
export class ShopsModule {}
