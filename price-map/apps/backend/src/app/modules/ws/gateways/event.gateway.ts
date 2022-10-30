import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Observable, of } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { BaseEntity } from '../../../models/test.entity';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  @InjectRepository(BaseEntity)
  private readonly repository: Repository<BaseEntity>;

  public async createEnt(): Promise<BaseEntity> {
    const user: BaseEntity = new BaseEntity();
    user.name = 'name 1' + Math.random();
    user.description = 'desc';

    return this.repository.save(user);
  }

  public async find() {
    const ent = await this.repository.findOneBy({
      name: 'name 1',
      description: 'description'
    })
    return ent;
  }

  public async create(): Promise<BaseEntity> {
    const newEnt = new BaseEntity();
    newEnt.name = 'name 1';
    newEnt.description = 'description';

    return await this.repository.save(newEnt);
  }

  public afterInit(server: any) {
    console.log('connected')  
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECTED')
  }

  @SubscribeMessage('send')
  public async handleMessage(@MessageBody() data: string): Promise<WsResponse<BaseEntity>> {
    console.log(data)
    const newEnt = await this.create();
    const ent = await this.find();
    return { event: 'send', data: ent };
  }
}


