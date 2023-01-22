import { Role } from '@core/enums';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { Logger } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
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

  @Roles(Role.User, Role.Admin)
  // @UseGuards(JwtAuthGuard('get product failed'), RolesAuthGuard('get product failed'))
  @SubscribeMessage('build route attempt')
  public getById(@MessageBody() coordinates: ICoordinates[]): Observable<WsResponse<IResponseData<number[][]>>> {
    console.time()
    return this.appService.buildRoute(coordinates)
      .pipe(
        switchMap((osrmData: any) => {
          const poly: string = osrmData.data.routes[0].geometry;
          const data: number[][] = polyline.decode(poly);
          console.log('daa', data)
          // Logger.debug(JSON.stringify(data));
          return of({
            event: 'build route successed',
            data: {
              statusCode: 200,
              error: false,
              //TODO: разобраться в кои-то веке с долготой и широтой
              data: data.map((value: number[]) => {
                const temp = value[0];
                value[0] = value[1];
                value[1] = temp;
                return value
              }),
              message: 'Маршрут успешно построен'
            }
          })
        }),
        catchError((err: Error) => {
          console.log(err, 123);
          console.timeEnd()
          Logger.error(err, 'AppGateway');
          return of({
            event: 'build route failed',
            data: {
              statusCode: 400,
              error: false,
              data: null,
              message: 'Во время построения маршрута произошла ошибка'
            }
          })
        })
      )
    
  }
}
