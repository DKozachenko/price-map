import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UsersService } from './services';
import { UsersGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@core/entities';
import { HashService } from '../../services';

/**
 * Модуль пользователей
 * @export
 * @class UsersModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([User], 'postgresConnect')],
  providers: [
    UsersService,
    HashService,
    UsersGateway,
    JwtService
  ],
  exports: [UsersService]
})
export class UsersModule {}
