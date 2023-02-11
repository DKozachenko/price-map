import { Injectable } from '@angular/core';
import { IUserFilter } from '@core/interfaces';
import { Subject, ReplaySubject } from 'rxjs';

/**
 * Сервис фильтра
 * @export
 * @class FilterService
 */
@Injectable()
export class FilterService {
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

  public currentMaxPrice$: Subject<number> = new Subject<number>();
};