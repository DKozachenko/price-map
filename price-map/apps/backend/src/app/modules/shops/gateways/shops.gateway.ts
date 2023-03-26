import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Roles } from '../../../decorators';
import { ShopEvents, Role } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { Shop } from '@core/entities';
import { ShopsService } from '../services';
import { DbErrorCode } from '@core/types';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';

/**
 * Шлюз магазинов
 * @export
 * @class ProductsGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ShopsGateway {
  constructor (private readonly shopsService: ShopsService) {}

  /**
   * Получение всех магазинов
   * @return {*}  {(Observable<WsResponse<IResponseData<Shop[] | null, DbErrorCode | null>>>)} магазины
   * @memberof ShopsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ShopEvents.GetShopsFailed), RolesAuthGuard(ShopEvents.GetShopsFailed))
  @SubscribeMessage(ShopEvents.GetShopsAttempt)
  public getAll():
    Observable<WsResponse<IResponseData<Shop[] | null, DbErrorCode | null>>> {
    return this.shopsService.getAll()
      .pipe(
        switchMap((shops: Shop[]) => {
          return of({
            event: ShopEvents.GetShopsSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: shops,
              message: 'Магазины успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ShopsGateway');
          return of({
            event: ShopEvents.GetShopsFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении магазинов'
            }
          });
        })
      );
  }

  /**
   * Получение магазина по id
   * @param {string} id id
   * @return {*}  {(Observable<WsResponse<IResponseData<Shop | null, DbErrorCode | null>>>)} магазин
   * @memberof ShopsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ShopEvents.GetShopFailed), RolesAuthGuard(ShopEvents.GetShopFailed))
  @SubscribeMessage(ShopEvents.GetShopAttempt)
  public getById(@MessageBody() id: string): Observable<WsResponse<IResponseData<Shop | null, DbErrorCode | null>>> {
    return this.shopsService.getById(id)
      .pipe(
        switchMap((shop: Shop | null) => {
          return of({
            event: ShopEvents.GetShopSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: shop,
              message: 'Магазин успешно получен'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ProductsGateway');
          return of({
            event: ShopEvents.GetShopFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении магазина'
            }
          });
        })
      );
  }

  /**
   * Получение магазинов по id
   * @param {string[]} ids массив id
   * @return {*}  {(Observable<WsResponse<IResponseData<Shop[] | null, DbErrorCode | null>>>)} товары
   * @memberof ShopsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ShopEvents.GetShopsByIdsFailed), RolesAuthGuard(ShopEvents.GetShopsByIdsFailed))
  @SubscribeMessage(ShopEvents.GetShopsByIdsAttempt)
  public getByIds(@MessageBody() ids: string[]): 
    Observable<WsResponse<IResponseData<Shop[] | null, DbErrorCode | null>>> {
    return this.shopsService.getByIds(ids)
      .pipe(
        switchMap((product: Shop[] | null) => {
          return of({
            event: ShopEvents.GetShopsByIdsSuccessed, 
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: product,
              message: 'Магазины по id успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ProductsGateway');
          return of({
            event: ShopEvents.GetShopsByIdsFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении магазинов по id'
            }
          });
        })
      );
  }
}
