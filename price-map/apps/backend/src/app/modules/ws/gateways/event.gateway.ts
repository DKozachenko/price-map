import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Socket } from 'dgram';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayConnection {

  public handleConnection(client: any, ...args: any[]) {
    console.log('connected')
  }

  @SubscribeMessage('send')
  handleMessage(client: Socket, payload: string): string {
    return 'dfgdfg';
  }
}


