import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { CategoryEvents, Role } from '@core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { IResponseData, IUserLoginInfo } from '@core/interfaces';
import { Category1Level, Category3Level } from '@core/entities';
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
  @SubscribeMessage(CategoryEvents.GetCategories1LevelAttempt)
  public async getAll(): Promise<WsResponse<IResponseData<Category1Level[]>>> {
    const products: Category1Level[] = await this.productsService.getAll();

    return {
      event: CategoryEvents.GetCategories1LevelSuccessed,
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
        message: 'Категория 3 уровня успешно получена'
      }
    };
  }
}
