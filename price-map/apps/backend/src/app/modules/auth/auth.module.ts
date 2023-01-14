import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthGateway } from './gateways';
import { jwtConstant } from '../../constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@price-map/core/entities';
import { UsersService } from '../users/services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ], 'postgresConnect'),
    PassportModule,
    JwtModule.register({
      secret: jwtConstant.secret,
      signOptions: { expiresIn: '10h' },
    }),
  ],
  providers: [
    UsersService,
    AuthGateway
  ]
})
export class AuthModule {}
