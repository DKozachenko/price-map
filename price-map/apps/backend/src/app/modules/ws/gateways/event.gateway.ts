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
    console.log('connected')  
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECTED')
  }

  @SubscribeMessage('send')
  handleMessage(@MessageBody() data: string): WsResponse<string> {
    console.log(data)
    return { event: 'send', data: 'sended' };
  }
}


