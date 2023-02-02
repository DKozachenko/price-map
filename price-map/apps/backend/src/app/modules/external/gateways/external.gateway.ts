import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { ExternalEvents, Role } from '@core/enums';
import { ExternalService } from '../services';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { ExternalErrorCode } from '@core/types';
import * as polyline  from '@mapbox/polyline';

/**
 * Шлюз пользователей
 * @export
 * @class UsersGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class ExternalGateway {
  constructor(private readonly externalService: ExternalService) { }

  /**
     * Событие построения маршрута 
     * @param {ICoordinates[]} coordinates коодинаты
     * @return {*}  {(Observable<WsResponse<IResponseData<number[][] | null, AppErrorCode | null>>>)} ответ
     * @memberof AppGateway
     */
  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get product failed'), RolesAuthGuard('get product failed'))
  @SubscribeMessage(ExternalEvents.BuildRouteAttempt)
  public buildRoute(@MessageBody() coordinates: ICoordinates[]): 
    Observable<WsResponse<IResponseData<number[][] | null, ExternalErrorCode | null>>> {
    return this.externalService.buildRoute(coordinates)
      .pipe(
        switchMap((osrmData: any) => {
          const poly: string = osrmData.data.routes[0].geometry;
          const data: number[][] = polyline.decode(poly);
          return of({
            event: ExternalEvents.BuildRouteSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: data.map((value: number[]) => {
                const temp = value[0];
                value[0] = value[1];
                value[1] = temp;
                return value;
              }),
              message: 'Маршрут успешно построен'
            }
          });
        }),
        catchError((err: Error) => {
          Logger.error(err, 'ExternalGateway');
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
