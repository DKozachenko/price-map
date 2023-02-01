import { Injectable, Logger } from '@nestjs/common';
import { ICoordinates } from '@core/interfaces';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';

/**
 * Главный сервис
 * @export
 * @class AppService
 */
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Создание строки с координатами через запятую
   * @private
   * @param {ICoordinates[]} coordinates координатами
   * @return {*}  {string} коодинаты через запятую
   * @memberof AppService
   */
  private createCoordinatesQuery(coordinates: ICoordinates[]): string {
    let result = '';
    for (let i = 0; i < coordinates.length; ++i) {
      if (i === coordinates.length - 1) {
        result += `${coordinates[i].latitude},${coordinates[i].longitude}`;
      } else {
        result += `${coordinates[i].latitude},${coordinates[i].longitude};`;
      }
    }

    return result;
  }

  /**
   * Построение маршрута через OSRM
   * @param {ICoordinates[]} coordinates коодинаты
   * @return {*}  {Observable<any>} ответ от OSRM
   * @memberof AppService
   */
  public buildRoute(coordinates: ICoordinates[]): Observable<any> {
    const query: string = 'http://router.project-osrm.org/route/v1/driving/'
      + `${this.createCoordinatesQuery(coordinates)}?overview=full`;
    Logger.debug(query);
    return this.httpService.get<any>(query);
  }
}