import { Observable, of, switchMap } from 'rxjs';
import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Roles } from '../../../decorators';
import { CategoryEvents, Role } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { Category1Level, Category3Level } from '@core/entities';
import { CategoriesService } from '../services';

/**
 * Шлюз категорий
 * @export
 * @class CategoriesGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class CategoriesGateway {
  constructor (private readonly categoriesService: CategoriesService) {}

  /**
   * Получение всех категорий 1 уровня
   * @return {*}  {Promise<WsResponse<IResponseData<Category1Level[]>>>}
   * @memberof CategoriesGateway
   */
  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage(CategoryEvents.GetCategories1LevelAttempt)
  public async getAllCategories1Level(): Promise<WsResponse<IResponseData<Category1Level[]>>> {
    let categories1Level: Category1Level[] = []; 

    try {
      categories1Level = await this.categoriesService.getAllCategories1Level();
    } catch (err: any) {
      return {
        event: CategoryEvents.GetCategories1LevelFailed,
        data: {
          statusCode: 500,
          error: true,
          data: null,
          message: 'Ошибка при получении категорий 1 уровня из базы'
        }
      };
    }

    return {
      event: CategoryEvents.GetCategories1LevelSuccessed,
      data: {
        statusCode: 200,
        error: false,
        data: categories1Level,
        message: 'Категории 1 уровня успешно получены'
      }
    };
  }

  /**
   * Получение категории 3 уровня по id 
   * @param {string} id id записи
   * @return {*}  {Promise<WsResponse<IResponseData<Category3Level>>>}
   * @memberof CategoriesGateway
   */
  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage(CategoryEvents.GetCategory3LevelAttempt)
  public getCategory3LevelById(@MessageBody() id: string): Observable<WsResponse<IResponseData<Category3Level>>> {
    return this.categoriesService.getCategory3LevelById(id)
      .pipe(
        switchMap((category3Level: Category3Level) => {
          return of({
            event: CategoryEvents.GetCategory3LevelSuccessed,
            data: {
              statusCode: 200,
              error: false,
              data: category3Level,
              message: 'Категория 3 уровня успешно получена'
            }
          });
        })
      );

    // try {
    //   category3Level = await this.categoriesService.getCategory3LevelById(id);
    // } catch (err: any) {
    //   return {
    //     event: CategoryEvents.GetCategory3LevelFailed,
    //     data: {
    //       statusCode: 500,
    //       error: true,
    //       data: null,
    //       message: 'Ошибка при получении категории 3 уровня из базы'
    //     }
    //   };
    // }

    // return {
    //   event: CategoryEvents.GetCategory3LevelSuccessed,
    //   data: {
    //     statusCode: 200,
    //     error: false,
    //     data: category3Level,
    //     message: 'Категория 3 уровня успешно получена'
    //   }
    // };
  }
}
