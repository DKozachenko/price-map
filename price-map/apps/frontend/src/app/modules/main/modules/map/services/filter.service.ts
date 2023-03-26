import { Injectable } from '@angular/core';
import { IPriceQuery, IRadiusQuery, IUserFilter } from '@core/interfaces';
import { Subject, ReplaySubject, Observable, debounceTime } from 'rxjs';
import { customCombineLastest } from '../components/operators';

/**
 * Сервис-стор фильтра
 * @export
 * @class FilterService
 */
@Injectable()
export class FilterService {
  /**
   * Начальное значение мин / макс цены
   * @private
   * @type {IPriceQuery}
   * @memberof FilterService
   */
  private initialPriceQueryValue: IPriceQuery = {
    max: null,
    min: null
  };

  /**
   * Подписка на получение мин / макс цены
   * @private
   * @type {ReplaySubject<IPriceQuery>}
   * @memberof FilterService
   */
  private initialPriceQuery: ReplaySubject<IPriceQuery> = new ReplaySubject(1);

  /**
   * Подписка на получение мин / макс цены (публичная)
   * @type {Observable<IPriceQuery>}
   * @memberof FilterService
   */
  public initialPriceQuery$: Observable<IPriceQuery> = this.initialPriceQuery.asObservable();

  /**
   * Событие установки начального значения мин / макс цены
   * @param {IPriceQuery} priceQuery начальное значение мин / макс цены
   * @memberof FilterService
   */
  public emitSettingInitialPriceQuery(priceQuery: IPriceQuery): void {
    this.initialPriceQueryValue = priceQuery;
    this.initialPriceQuery.next(priceQuery);
  }

  /**
   * Выбранные id категорий 3 уровня
   * @private
   * @type {Set<string>}
   * @memberof FilterService
   */
  private chechedCategory3LevelIdsValue: Set<string> = new Set<string>();
  
  /**
   * Подписка на изменение выбранных id категорий 3 уровня
   * @private
   * @type {ReplaySubject<Set<string>>}
   * @memberof FilterService
   */
  private chechedCategory3LevelIds: ReplaySubject<Set<string>> = new ReplaySubject<Set<string>>(1);

  /**
   * Подписка на изменение выбранных id категорий 3 уровня (публичная)
   * @type {Observable<Set<string>>}
   * @memberof FilterService
   */
  public chechedCategory3LevelIds$: Observable<Set<string>> = this.chechedCategory3LevelIds.asObservable();

  /**
   * Событие установки выбранных id категорий 3 уровня
   * @param {Set<string>} ids множество id категорий 3 уровня
   * @memberof FilterService
   */
  public emitSettingCheckedCategory3LevelIds(ids: Set<string>): void {
    this.chechedCategory3LevelIdsValue = ids;
    this.chechedCategory3LevelIds.next(ids);
  }

  /**
   * Значения фильтров категории
   * @private
   * @type {IUserFilter[]}
   * @memberof FilterService
   */
  private filterValuesValue: IUserFilter[] = [];

  /**
   * Подписка на изменение фильтров категории
   * @private
   * @type {Subject<IUserFilter[]>}
   * @memberof FilterService
   */
  private filterValues: Subject<IUserFilter[]> = new Subject<IUserFilter[]>();

  /**
   * Подписка на изменение фильтров категории (публичная)
   * @type {Observable<IUserFilter[]>}
   * @memberof FilterService
   */
  public filterValues$: Observable<IUserFilter[]> = this.filterValues.asObservable();

  /**
   * Событие изменения фильтров категории
   * @param {IUserFilter[]} values новые фильтры
   * @memberof FilterService
   */
  public emitSettingFilterValues(values: IUserFilter[]): void {
    this.filterValuesValue = values;
    this.filterValues.next(values);
  }

  /**
   * Текущие фильтр цены
   * @private
   * @type {IPriceQuery}
   * @memberof FilterService
   */
  private currentPriceQueryValue: IPriceQuery = {
    max: null,
    min: null
  };

  /**
   * Подписка на изменение фильтра цены
   * @private
   * @type {Subject<IPriceQuery>}
   * @memberof FilterService
   */
  private currentPriceQuery: Subject<IPriceQuery> = new Subject<IPriceQuery>();

  /**
   * Подписка на изменение фильтра цены (публичная)
   * @type {Observable<IPriceQuery>}
   * @memberof FilterService
   */
  public currentPriceQuery$: Observable<IPriceQuery> = this.currentPriceQuery.asObservable();
  
  /**
   * Событие установки фильтра цены
   * @param {IPriceQuery} query новый фильтр цены
   * @memberof FilterService
   */
  public emitSettingPriceQuery(query: IPriceQuery): void {
    this.currentPriceQueryValue = query;
    this.currentPriceQuery.next(query);
  }

  /**
   * Текущий фильтр радиуса
   * @private
   * @type {IRadiusQuery}
   * @memberof FilterService
   */
  private radiusQueryValue: IRadiusQuery = {
    distance: null,
    center: null
  };

  /**
   * Подписка на изменение фильтра радиуса
   * @private
   * @type {Subject<IRadiusQuery>}
   * @memberof FilterService
   */
  private radiusQuery: Subject<IRadiusQuery> = new Subject<IRadiusQuery>();

  /**
   * Подписка на изменение фильтра радиуса (публичная)
   * @type {Observable<IRadiusQuery>}
   * @memberof FilterService
   */
  public radiusQuery$: Observable<IRadiusQuery> = this.radiusQuery.asObservable();

  /**
   * Событие установки фильтра радиуса
   * @param {IRadiusQuery} query новый фильтр радиуса
   * @memberof FilterService
   */
  public emitSettingRadiusQuery(query: IRadiusQuery): void {
    this.radiusQueryValue = query;
    this.radiusQuery.next(query);
  }

  /**
   * Аккумулирующая подписка на все фильтры
   * @type {Observable<[Set<string>, IUserFilter[], IPriceQuery, IRadiusQuery]>}
   * @memberof FilterService
   */
  public allFilters$: Observable<[Set<string>, IUserFilter[], IPriceQuery, IRadiusQuery]> 
    = <Observable<[Set<string>, IUserFilter[], IPriceQuery, IRadiusQuery]>>customCombineLastest([
    this.chechedCategory3LevelIds$,
    this.filterValues$.pipe(debounceTime(400)),
    this.currentPriceQuery$,
    this.radiusQuery$
  ])
}
