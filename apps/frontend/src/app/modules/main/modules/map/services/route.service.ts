import { Injectable } from '@angular/core';
import { RouteLeg } from 'osrm';
import { ReplaySubject, Observable } from 'rxjs';

/**
 * Сервис-стор маршрута
 * @export
 * @class RouteService
 */
@Injectable()
export class RouteService {
  /**
   * Маршруты между ключевыми точками
   * @private
   * @type {RouteLeg[]}
   * @memberof RouteService
   */
  private legsValue: RouteLeg[] = [];

  /**
   * Подписка на изменение маршрутов
   * @private
   * @type {ReplaySubject<RouteLeg[]>}
   * @memberof RouteService
   */
  private legs: ReplaySubject<RouteLeg[]> = new ReplaySubject<RouteLeg[]>(1);

  /**
   * Подписка на изменение маршрутов (публичная)
   * @type {Observable<RouteLeg[]>}
   * @memberof RouteService
   */
  public legs$: Observable<RouteLeg[]> = this.legs.asObservable();

  /**
   * Событие установки маршрутов
   * @param {RouteLeg[]} legs маршруты
   * @memberof RouteService
   */
  public emitLegs(legs: RouteLeg[]): void {
    this.legsValue = legs;
    this.legs.next(legs);
  }
}
