import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  public afterInit(server: any) {
    
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECTED')
  }

  @SubscribeMessage('send')
  public async handleMessage(@MessageBody() data: string): Promise<WsResponse<{ name: string }>> {
    console.log(data)
    return { event: 'send', data: { name: 'lox' } };
  }
}


