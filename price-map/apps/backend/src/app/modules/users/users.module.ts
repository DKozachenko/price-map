import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UsersService } from './services';
import { UsersGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@core/entities';

/**
 * Модуль пользователей
 * @export
 * @class UsersModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([User], 'postgresConnect')],
  providers: [
    UsersService,
    UsersGateway,
    JwtService
  ],
  exports: [UsersService]
})
export class UsersModule {}
