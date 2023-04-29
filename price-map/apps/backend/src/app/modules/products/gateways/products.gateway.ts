import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Roles } from '../../../decorators';
import { ExternalEvents, ProductEvents, Role } from '@core/enums';
import { ICoordinates, IOsrmData, IPriceQuery, IProductQuery, IResponseData } from '@core/interfaces';
import { Product } from '@core/entities';
import { ProductsService } from '../services';
import { DbErrorCode, ExternalErrorCode } from '@core/types';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { RabbitService } from '../../../services';
import { IMessage } from '../../../models/interfaces';
import { OSRM_REQUESTER_REQUEST_QUEUE, OSRM_REQUESTER_RESPONSE_QUEUE } from '../../../models/constants';

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
  constructor (private readonly productsService: ProductsService,
    private readonly rabbitService: RabbitService) {}

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

  /**
   * Получение диапазона цен
   * @return {*}  {(Observable<WsResponse<IResponseData<IPriceQuery | null, DbErrorCode | null>>>)} диапазон цен
   * @memberof ProductsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ProductEvents.GetPriceRangeFailed), RolesAuthGuard(ProductEvents.GetPriceRangeFailed))
  @SubscribeMessage(ProductEvents.GetPriceRangeAttempt)
  public getPriceRange(): Observable<WsResponse<IResponseData<IPriceQuery | null, DbErrorCode | null>>> {
    return this.productsService.getPriceRange()
      .pipe(
        switchMap((priceQuery: IPriceQuery) => {
          return of({
            event: ProductEvents.GetPriceRangeSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: priceQuery,
              message: 'Диапазон цен успешно получен'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ProductsGateway');
          return of({
            event: ProductEvents.GetPriceRangeFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении диапазона цен'
            }
          });
        })
      );
  }

  /**
   * Получение товаров по id
   * @param {string[]} ids массив id
   * @return {*}  {(Observable<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>>)} массив товаров
   * @memberof ProductsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ProductEvents.GetProductsByIdsFailed), RolesAuthGuard(ProductEvents.GetProductsByIdsFailed))
  @SubscribeMessage(ProductEvents.GetProductsByIdsAttempt)
  public getByIds(@MessageBody() ids: string[]):
    Observable<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>> {
    return this.productsService.getByIds(ids)
      .pipe(
        switchMap((product: Product[] | null) => {
          return of({
            event: ProductEvents.GetProductsByIdsSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: product,
              message: 'Товары по id успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'ProductsGateway');
          return of({
            event: ProductEvents.GetProductsByIdsFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении товаров по id'
            }
          });
        })
      );
  }

  /**
   * Событие построения маршрута
   * @param {ICoordinates[]} coordinates коодинаты
   * @return {*}  {(Observable<WsResponse<IResponseData<IOsrmData | null, ExternalErrorCode | null>>>)} ответ
   * @memberof ProductsGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ExternalEvents.BuildRouteFailed), RolesAuthGuard(ExternalEvents.BuildRouteFailed))
  @SubscribeMessage(ExternalEvents.BuildRouteAttempt)
  public buildRoute(@MessageBody() coordinates: ICoordinates[]):
    Observable<WsResponse<IResponseData<IOsrmData | null, ExternalErrorCode | null>>> {
    const coordinatesStr: string = this.productsService.createCoordinatesQuery(coordinates);
    this.rabbitService.sendMessage<string>(OSRM_REQUESTER_REQUEST_QUEUE, {
      data: coordinatesStr,
      description: `Построение маршрута для ${coordinates.length} точек`,
      sendTime: new Date()
    });
    return this.rabbitService.getMessage<IOsrmData>(OSRM_REQUESTER_RESPONSE_QUEUE)
      .pipe(
        switchMap((message: IMessage<IOsrmData>) => {
          return of({
            event: ExternalEvents.BuildRouteSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: message.data,
              message: 'Маршрут успешно построен'
            }
          });
        }),
        catchError((err: Error) => {
          Logger.error(err, 'ProductsGateway');
          return of({
            event: ExternalEvents.BuildRouteFailed,
            data: {
              statusCode: 503,
              errorCode: <ExternalErrorCode>'BUILD_ROUTE_FAILED',
              isError: true,
              data: null,
              message: 'Ошибка во время построения маршрута'
            }
          });
        })
      );
  }
}
