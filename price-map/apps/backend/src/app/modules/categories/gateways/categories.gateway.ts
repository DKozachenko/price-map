import { catchError, Observable, of, switchMap } from 'rxjs';
import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Roles } from '../../../decorators';
import { CategoryEvents, Role } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { Category1Level, Category3Level } from '@core/entities';
import { CategoriesService } from '../services';
import { DbErrorCode } from '@core/types';
import { Logger } from '@nestjs/common';

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
   * @return {*}  {Observable<WsResponse<IResponseData<Category1Level[] | null, DbErrorCode | null>>>}
   * @memberof CategoriesGateway
   */
  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage(CategoryEvents.GetCategories1LevelAttempt)
  public getAllCategories1Level(): Observable<WsResponse<IResponseData<Category1Level[] | null, DbErrorCode | null>>> {
    return this.categoriesService.getAllCategories1Level()
      .pipe(
        switchMap((categories1Level: Category1Level[]) => {
          return of({
            event: CategoryEvents.GetCategories1LevelSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: categories1Level,
              message: 'Категории 1 уровня успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'CategoriesGateway');
          return of({
            event: CategoryEvents.GetCategories1LevelFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении категорий 1 уровня'
            }
          });
        })
      );
  }

  /**
   * Получение категории 3 уровня по id 
   * @param {string} id id записи
   * @return {*}  {Observable<WsResponse<IResponseData<Category3Level | null, DbErrorCode | null>>>}
   * @memberof CategoriesGateway
   */
  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get categories 1 level failed'), RolesAuthGuard('get categories 1 level failed'))
  @SubscribeMessage(CategoryEvents.GetCategory3LevelAttempt)
  public getCategory3LevelById(@MessageBody() id: string): 
    Observable<WsResponse<IResponseData<Category3Level | null, DbErrorCode | null>>> {
    return this.categoriesService.getCategory3LevelById(id)
      .pipe(
        switchMap((category3Level: Category3Level) => {
          return of({
            event: CategoryEvents.GetCategory3LevelSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: category3Level,
              message: 'Категория 3 уровня успешно получена'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'CategoriesGateway');
          return of({
            event: CategoryEvents.GetCategory3LevelFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка во время постоения маршрута'
            }
          });
        })
      );
  }
}
