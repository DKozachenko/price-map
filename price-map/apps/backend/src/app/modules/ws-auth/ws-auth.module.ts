import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from '../auth/models/constants';
import { AuthService } from '../auth/services';
import { JwtStrategy, LocalStrategy } from '../auth/strategies';
import { UsersService } from '../users/services';
import { WsAuthGateway } from './gateways';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10h' },
    }),
  ],
  providers: [
    WsAuthGateway,
    AuthService,
    UsersService,
    LocalStrategy,
    JwtStrategy
  ]
})
export class WsAuthModule {}
