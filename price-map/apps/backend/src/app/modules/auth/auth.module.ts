import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services';
import { AuthGateway } from './gateways';
import { jwtConstant } from '../../constants';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstant.secret,
      signOptions: { expiresIn: '10h' },
    }),
  ],
  providers: [
    AuthService,
    AuthGateway
  ],
  exports: [AuthService],
})
export class AuthModule {}
