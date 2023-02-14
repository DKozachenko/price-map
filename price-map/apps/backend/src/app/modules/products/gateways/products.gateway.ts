import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Roles } from '../../../decorators';
import { ProductEvents, Role } from '@core/enums';
import { IProductQuery, IResponseData } from '@core/interfaces';
import { Product } from '@core/entities';
import { ProductsService } from '../services';
import { DbErrorCode } from '@core/types';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';

/**
 * Шлюз товаров
 * @export
 * @class ProductsGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ProductsGateway {
  constructor (private readonly productsService: ProductsService) {}

  /**
   * Полуение товаров по запросу
   * @param {*} query запрос
   * @return {*}  {(Observable<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>>)} товары
   * @memberof ProductsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ProductEvents.GetProductsFailed), RolesAuthGuard(ProductEvents.GetProductsFailed))
  @SubscribeMessage(ProductEvents.GetProductsAttempt)
  public getAll(@MessageBody() query: IProductQuery):
    Observable<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>> {
    return this.productsService.getAll(query)
      .pipe(
        switchMap((products: Product[]) => {
          return of({
            event: ProductEvents.GetProductsSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: products,
              message: 'Товары успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ProductsGateway');
          return of({
            event: ProductEvents.GetProductsFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении товаров'
            }
          });
        })
      );
  }

  /**
   * Получение товара по id
   * @param {string} id id
   * @return {*}  {(Observable<WsResponse<IResponseData<Product | null, DbErrorCode | null>>>)} товар
   * @memberof ProductsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ProductEvents.GetProductFailed), RolesAuthGuard(ProductEvents.GetProductFailed))
  @SubscribeMessage(ProductEvents.GetProductAttempt)
  public getById(@MessageBody() id: string): Observable<WsResponse<IResponseData<Product | null, DbErrorCode | null>>> {
    return this.productsService.getById(id)
      .pipe(
        switchMap((product: Product | null) => {
          return of({
            event: ProductEvents.GetProductSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: product,
              message: 'Товар успешно получен'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ProductsGateway');
          return of({
            event: ProductEvents.GetProductFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении товара'
            }
          });
        })
      );
  }
}
