import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Category3Level } from '@price-map/core/entities';
import { Repository } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  @InjectRepository(Category3Level, 'postgresConnect')
  private readonly repository: Repository<Category3Level>;

  public async afterInit(server: any): Promise<void> {
    const cat3first = new Category3Level();

    const categories = await this.repository.find();
    console.log('init', categories)
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


