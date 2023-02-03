import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGateway } from './gateways';
import { secretKey } from '../../models/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@core/entities';
import { UsersService } from '../users/services';
import { HashService } from './services';

/**
 * Модуль авторизации
 * @export
 * @class AuthModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'postgresConnect'),
    PassportModule,
    JwtModule.register({
      secret: secretKey,
      signOptions: { expiresIn: '10h' },
    }),
  ],
  providers: [
    UsersService,
    HashService,
    AuthGateway,
    JwtService
  ]
})
export class AuthModule {}
