import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { Role } from '@price-map/core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { IResponseData, IUserLoginInfo } from '@price-map/core/interfaces';
import { Category1Level, Category3Level } from '@price-map/core/entities';
import { Categories1LevelService } from '../services';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class Categories1LevelGateway {
  constructor (private readonly productsService: Categories1LevelService) {}

  @Roles(Role.User)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage('get categories 1 level attempt')
  public async getAll(): Promise<WsResponse<IResponseData<Category1Level[]>>> {
    const products: Category1Level[] = await this.productsService.getAll();

    return {
      event: 'get categories 1 level successed',
      data: {
        statusCode: 200,
        error: false,
        data: products,
        message: 'Категории 1 уровня успешно получены'
      }
    };
  }

  @Roles(Role.User)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage('get category 3 level attempt')
  public async getCategory3Level(@MessageBody() data: { id: string }):
    Promise<WsResponse<IResponseData<Category3Level>>> {
    const product: Category3Level = await this.productsService.getById(data.id);

    return {
      event: 'get category 3 level successed',
      data: {
        statusCode: 200,
        error: false,
        data: product,
        message: 'Категории 1 уровня успешно получены'
      }
    };
  }
}
