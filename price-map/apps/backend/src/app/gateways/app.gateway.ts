import { AppEvents, Role } from '@core/enums';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { Logger } from '@nestjs/common';
import { MessageBody, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  OnGatewayInit, 
  SubscribeMessage, 
  WebSocketGateway, 
  WsResponse } from '@nestjs/websockets';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { Roles } from '../decorators';
import { AppService } from '../services';
import * as polyline  from '@mapbox/polyline';

/**
 * Главный шлюз приложения
 * @export
 * @class AppGateway
 * @implements {OnGatewayInit}
 * @implements {OnGatewayConnection}
 * @implements {OnGatewayDisconnect}
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly appService: AppService) {}

  public afterInit(server: any) {
    Logger.log('Socket init', 'AppGateway');
  }

  public handleConnection(client: any, ...args: any[]) {
    Logger.log('Socket connected', 'AppGateway');
  }

  public handleDisconnect(client: any) {
    Logger.log('Socket disconnected', 'AppGateway');
  }

  /**
   * Событие построения маршрута 
   * @param {ICoordinates[]} coordinates коодинаты
   * @return {*}  {Observable<WsResponse<IResponseData<number[][]>>>}
   * @memberof AppGateway
   */
  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get product failed'), RolesAuthGuard('get product failed'))
  @SubscribeMessage(AppEvents.BuildRouteAttempt)
  public buildRoute(@MessageBody() coordinates: ICoordinates[]): Observable<WsResponse<IResponseData<number[][]>>> {
    return this.appService.buildRoute(coordinates)
      .pipe(
        switchMap((osrmData: any) => {
          const poly: string = osrmData.data.routes[0].geometry;
          const data: number[][] = polyline.decode(poly);
          return of({
            event: AppEvents.BuildRouteSuccessed,
            data: {
              statusCode: 200,
              error: false,
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
          Logger.error(err, 'AppGateway');
          return of({
            event: AppEvents.BuildRouteFailed,
            data: {
              statusCode: 400,
              error: false,
              data: null,
              message: 'Во время построения маршрута произошла ошибка'
            }
          });
        })
      );
  }
}
