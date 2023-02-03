import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { Role } from '@core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';

/**
 * Шлюз пользователей
 * @export
 * @class UsersGateway
 */
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
