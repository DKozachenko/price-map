import { Logger } from '@nestjs/common';
import { OnGatewayConnection, 
  OnGatewayDisconnect, 
  OnGatewayInit, 
  WebSocketGateway } from '@nestjs/websockets';

/**
 * Главный шлюз приложения
 * @export
 * @class AppGateway
 * @implements {OnGatewayInit}
 * @implements {OnGatewayConnection}
 * @implements {OnGatewayDisconnect}
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  public afterInit(server: any) {
    Logger.log('Socket init', 'AppGateway');
  }

  public handleConnection(client: any, ...args: any[]) {
    Logger.log('Socket connected', 'AppGateway');
  }

  public handleDisconnect(client: any) {
    Logger.log('Socket disconnected', 'AppGateway');
  }
}
