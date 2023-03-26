import { Injectable } from '@angular/core';
import { ReplaySubject, Subject, Observable } from 'rxjs';
import { BaseSidebar } from '../classes';
import { IAction } from '../modules/map/models/interfaces';

/**
 * Сервис-стор товаров
 * @export
 * @class ProductService
 * @extends {BaseSidebar}
 */
@Injectable()
export class ProductService extends BaseSidebar {
  /**
   * Ids товаров для построения маршрута
   * @private
   * @type {Set<string>}
   * @memberof ProductService
   */
  private productIdsToRouteValue: Set<string> = new Set<string>();

  /**
   * Получение id товаров для построения маршрутов
   * @return {*}  {Set<string>} множество id
   * @memberof ProductService
   */
  public getProductIdsToRoute(): Set<string> {
    return this.productIdsToRouteValue;
  }

  /**
   * Подписка на изменение id товаров для построения маршрута
   * @private
   * @type {Subject<Set<string>>}
   * @memberof ProductService
   */
  private productIdsToRoute: Subject<Set<string>> = new Subject<Set<string>>();
  
  /**
   * Подписка на изменение id товаров для построения маршрута (публичная)
   * @type {Observable<Set<string>>}
   * @memberof ProductService
   */
  public productIdsToRoute$: Observable<Set<string>> = this.productIdsToRoute.asObservable();

  /**
   * Подписка на добавление id товара в множество id товаров для построения маршрута
   * @private
   * @type {ReplaySubject<string>}
   * @memberof ProductService
   */
  private addProductIdToRoute: ReplaySubject<string> = new ReplaySubject<string>(1);

  /**
   * Подписка на добавление id товара в множество id товаров для построения маршрута (публичная)
   * @type {Observable<string>}
   * @memberof ProductService
   */
  public addProductIdToRoute$: Observable<string> = this.addProductIdToRoute;

  /**
   * Подписка на удаления id товара из множество id товаров для построения маршрута
   * @private
   * @type {Subject<string>}
   * @memberof ProductService
   */
  private deleteProductIdFromRoute: Subject<string> = new Subject<string>();
  
  /**
   * Подписка на удаления id товара из множества id товаров для построения маршрута (публичная)
   * @type {Observable<string>}
   * @memberof ProductService
   */
  public deleteProductIdFromRoute$: Observable<string> = this.deleteProductIdFromRoute.asObservable();
  
  /**
   * Событие добавления id товара в множество id товаров для построения маршрута 
   * @param {string} id id товара
   * @memberof ProductService
   */
  public emitAdditionProductIdToRoute(id: string): void {
    this.productIdsToRouteValue.add(id);
    this.productIdsToRoute.next(this.productIdsToRouteValue);
    this.addProductIdToRoute.next(id);
  }

  /**
   * Событие удаления id товара из множества id товаров для построения маршрута 
   * @param {string} id id товара
   * @memberof ProductService
   */
  public emitRemovingProductIdFromRoute(id: string): void {
    this.productIdsToRouteValue.delete(id);
    this.productIdsToRoute.next(this.productIdsToRouteValue);
    this.deleteProductIdFromRoute.next(id);
  }

  /**
   * Id избранных товаров
   * @private
   * @type {Set<string>}
   * @memberof ProductService
   */
  private favoriteProductIdsValue: Set<string> = new Set<string>();

  /**
   * Получение id избранных товаров
   * @return {*}  {Set<string>} множество id избранных товаров
   * @memberof ProductService
   */
  public getFavoriteProductIds(): Set<string> {
    return this.favoriteProductIdsValue;
  }

  /**
   * Установка id избранных товаров
   * @param {Set<string>} newIds множество id избранных товаров
   * @memberof ProductService
   */
  public setFavoriteProductIds(newIds: Set<string>): void {
    this.favoriteProductIdsValue = newIds;
  }

  /**
   * Добавление id избранного товара
   * @param {string} id id товара
   * @memberof ProductService
   */
  public addFavoriteProductId(id: string) {
    this.favoriteProductIdsValue.add(id);
  }

  /**
   * Удаление id избранного товара
   * @param {string} id id товара
   * @memberof ProductService
   */
  public removeFavoriteProductId(id: string) {
    this.favoriteProductIdsValue.delete(id);
  }
  
  /**
   * Текущее действие с товаром
   * @private
   * @type {IAction}
   * @memberof ProductService
   */
  private productActionValue: IAction;

  /**
   * Подписка на действие для товара
   * @private
   * @type {Subject<IAction>}
   * @memberof ProductService
   */
  private productAction: Subject<IAction> = new Subject<IAction>();
  
  /**
   * Подписка на действие для товара (публичная)
   * @type {Observable<IAction>}
   * @memberof ProductService
   */
  public productAction$: Observable<IAction> = this.productAction.asObservable();

  /**
   * Событие добавления действия для товара
   * @param {IAction} action действие
   * @memberof ProductService
   */
  public emitAdditionProductAction(action: IAction): void {
    this.productActionValue = action;
    this.productAction.next(action);
  }
}