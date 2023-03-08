/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ICoordinates } from '@core/interfaces';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';

/**
 * Сервис для внешнего взаимодействия
 * @export
 * @class ExternalService
 */
@Injectable()
export class ExternalService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Создание строки с координатами через запятую
   * @private
   * @param {ICoordinates[]} coordinates координатами
   * @return {*}  {string} коодинаты через запятую (в формате {longitude},{latitude})
   * @memberof AppService
   */
  private createCoordinatesQuery(coordinates: ICoordinates[]): string {
    let result = '';
    for (let i = 0; i < coordinates.length; ++i) {
      if (i === coordinates.length - 1) {
        result += `${coordinates[i].longitude},${coordinates[i].latitude}`;
      } else {
        result += `${coordinates[i].longitude},${coordinates[i].latitude};`;
      }
    }

    return result;
  }

  /**
   * Смена координат (из {latitude},{longitude} в {longitude},{latitude})
   * @param {number[]} coordinate координата
   * @return {*}  {number[]} коодината с поменяными широтой и долготой
   * @memberof ExternalService
   */
  public swapCoordinates(coordinate: number[]): number[] {
    const temp = coordinate[0];
    coordinate[0] = coordinate[1];
    coordinate[1] = temp;
    return coordinate;
  }

  /**
   * Построение маршрута через OSRM
   * @param {ICoordinates[]} coordinates коодинаты
   * @return {*}  {Observable<any>} ответ от OSRM
   * @memberof AppService
   */
  //TODO: чуть-чуть типов для any
  public buildRoute(coordinates: ICoordinates[]): Observable<any> {
    const query: string = 'http://router.project-osrm.org/route/v1/driving/'
      + `${this.createCoordinatesQuery(coordinates)}?overview=full`;
    return this.httpService.get<any>(query);
  }


  /**
   * Получение точек (нод, путей, полигонов) по названию из OSM API
   * @param {string} name назва
   * @return {*}  {Observable<any>} ответ от OSM API
   * @memberof ExternalService
   */
  //TODO: чуть-чуть типов для any
  public getOSMPointsByName(name: string): Observable<any> {
    const query: string = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=[out:json];' 
      + `area[place=city][name="Новосибирск"] -> .nsk;nwr[name~"${name}"](area.nsk) -> .data;.data out geom;`;
    return this.httpService.get<any>(query);
  }
}
