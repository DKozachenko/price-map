import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { ExternalEvents, Role } from '@core/enums';
import { ExternalService } from '../services';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { ICoordinates, IOsrmData, IResponseData } from '@core/interfaces';
import { ExternalErrorCode } from '@core/types';
import * as polyline  from '@mapbox/polyline';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { RouteLeg, RouteResults } from 'osrm';

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
   * @return {*}  {(Observable<WsResponse<IResponseData<number[][] | null, ExternalErrorCode | null>>>)} ответ
   * @memberof AppGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(ExternalEvents.BuildRouteFailed), RolesAuthGuard(ExternalEvents.BuildRouteFailed))
  @SubscribeMessage(ExternalEvents.BuildRouteAttempt)
  public buildRoute(@MessageBody() coordinates: ICoordinates[]):
    Observable<WsResponse<IResponseData<IOsrmData  | null, ExternalErrorCode | null>>> {
    return this.externalService.buildRoute(coordinates)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        switchMap((response: any) => {
          const result: RouteResults = response.data;
          const encodedPolyline: string = result.routes[0].geometry;
          const decodedCoordinates: number[][] = polyline.decode(encodedPolyline);
          return of({
            event: ExternalEvents.BuildRouteSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: {
                coordinates: decodedCoordinates.map((value: number[]) => this.externalService.swapCoordinates(value)),
                legs: result.routes[0].legs
              },
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
