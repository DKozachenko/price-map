import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGateway } from './gateways';
import { secretKey } from '../../constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@price-map/core/entities';
import { UsersService } from '../users/services';

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
    AuthGateway,
    JwtService
  ]
})
export class AuthModule {}
