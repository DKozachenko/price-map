import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Category2Level, Category3Level, Category1Level } from '@price-map/core/entities';
import { Repository } from 'typeorm';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  @InjectRepository(Category3Level, 'postgresConnect')
  private readonly repository3: Repository<Category3Level>;

  @InjectRepository(Category2Level, 'postgresConnect')
  private readonly repository2: Repository<Category2Level>;

  @InjectRepository(Category1Level, 'postgresConnect')
  private readonly repository1: Repository<Category1Level>;

  public async afterInit(server: any): Promise<void> {
    // Пример сохранения с каскадностью
    const cat3first = new Category3Level();
    cat3first.name = 'cat 3 first';
    cat3first.filters = [];

    const cat3second = new Category3Level();
    cat3second.name = 'cat 3 second';
    cat3second.filters = [];

    const cat3third = new Category3Level();
    cat3third.name = 'cat 3 third';
    cat3third.filters = [];

    const cat2first = new Category2Level();
    cat2first.name = 'cat 2 first';
    cat2first.categories3Level = [cat3first, cat3second];

    const cat2second = new Category2Level();
    cat2second.name = 'cat 2 second';
    cat2second.categories3Level = [cat3third];

    const cat1first = new Category1Level();
    cat1first.name = 'cat 1 first';
    cat1first.categories2Level = [cat2first, cat2second];

    // await this.repository1.save([cat1first])

    const categories1 = await this.repository1.find({
    });
    console.log('repository1', categories1)

    const categories2 = await this.repository2.find({
      relations: {
        category1Level: true
      }
    });
    console.log('repository2', categories2)

    const categories3 = await this.repository3.find({
      relations: {
        category2Level: true
      }
    });
    console.log('repository3', categories3)
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


