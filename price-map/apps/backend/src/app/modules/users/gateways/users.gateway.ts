import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../../users/services/users.service';
import { JwtAuthGuard } from './../../auth/guards/jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse } from '@nestjs/websockets';
import { Category2Level, Category3Level, Category1Level } from '@price-map/core/entities';
import { Repository } from 'typeorm';
import { UseGuards } from '@nestjs/common';
import { LocalAuthGuard, RolesAuthGuard } from '../../auth/guards';
import { AuthService } from '../../auth/services';
import { Server } from 'http';
import * as bcrypt from 'bcrypt';
import { Roles } from '../../../decorators';
import { Role } from '../../auth/models/enums';
import { jwtConstants } from '../../auth/models/constants';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class UsersGateway {
  constructor () {}

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard('get users failed'), RolesAuthGuard('get users failed'))
  @SubscribeMessage('get users attempt')
  public async login(@MessageBody() data: any): Promise<WsResponse<{ test: any } | any>> {
    return {
      event: 'get users successed',
      data: data
    };
  }
}
