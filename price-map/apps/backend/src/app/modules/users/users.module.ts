import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UsersService } from './services';
import { UsersGateway } from './gateways';

@Module({
  providers: [
    UsersService,
    UsersGateway,
    JwtService
  ],
  exports: [UsersService]
})
export class UsersModule {}
