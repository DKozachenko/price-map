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
import { CategoriesService } from '../services';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class CategoriesGateway {
  constructor (private readonly categoriesService: CategoriesService) {}

  @Roles(Role.User)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage(CategoryEvents.GetCategories1LevelAttempt)
  public async getAll(): Promise<WsResponse<IResponseData<Category1Level[]>>> {
    const products: Category1Level[] = await this.categoriesService.getAll();

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

  //TODO: переписать роуты на Observable
  @Roles(Role.User)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage(CategoryEvents.GetCategory3LevelAttempt)
  public async getCategory3Level(@MessageBody() id: string):
    Promise<WsResponse<IResponseData<Category3Level>>> {
    const product: Category3Level = await this.categoriesService.getById(id);

    return {
      event: CategoryEvents.GetCategory3LevelSuccessed,
      data: {
        statusCode: 200,
        error: false,
        data: product,
        message: 'Категория 3 уровня успешно получена'
      }
    };
  }
}
