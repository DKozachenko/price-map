/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  public afterInit(server: any): void {
    Logger.log('Socket init', 'AppGateway');
  }

  public handleConnection(client: any, ...args: any[]): void {
    Logger.log('Socket connected', 'AppGateway');
  }

  public handleDisconnect(client: any): void {
    Logger.log('Socket disconnected', 'AppGateway');
  }
}
