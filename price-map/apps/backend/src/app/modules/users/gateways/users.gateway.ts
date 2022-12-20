import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { Role } from '@price-map/core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';

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
