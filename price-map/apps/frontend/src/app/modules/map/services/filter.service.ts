import { Injectable } from '@angular/core';
import { IPriceQuery, IUserFilter } from '@core/interfaces';
import { Subject, ReplaySubject, BehaviorSubject } from 'rxjs';

/**
 * Сервис фильтра
 * @export
 * @class FilterService
 */
@Injectable()
export class FilterService {
  public priceQuery: IPriceQuery = {
    max: null,
    min: null
  };
  /**
   * Id выбранных категорий 3 уровня
   * @type {ReplaySubject<Set<string>>}
   * @memberof FilterService
   */
  public chechedCategory3LevelIds$: ReplaySubject<Set<string>> = new ReplaySubject<Set<string>>(1);
  /**
   * Значения фильтров
   * @type {Subject<IUserFilter[]>}
   * @memberof FilterService
   */
  public filterValues$: Subject<IUserFilter[]> = new Subject<IUserFilter[]>();

  public currentMaxPrice$: Subject<IPriceQuery> = new Subject<IPriceQuery>();

  public addPriceQuery(price: IPriceQuery): void {
    this.priceQuery = price;
    this.currentMaxPrice$.next(this.priceQuery);
  }
}
