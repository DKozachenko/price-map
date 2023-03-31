import { Observable, ReplaySubject } from 'rxjs';

/**
 * Базовый сервис-стор
 * @export
 * @class BaseSidebar
 */
export class BaseSidebar {
  /**
   * Id элементов для отображения в сайдбаре
   * @private
   * @type {string[]}
   * @memberof BaseSidebar
   */
  private itemIdsToShowValue: string[] = []; 

  /**
   * Подписка на изменение id элементов для отображения в сайдбаре
   * @private
   * @type {ReplaySubject<string[]>}
   * @memberof BaseSidebar
   */
  private itemIdsToShow: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  /**
   * Подписка на изменение id элементов для отображения в сайдбаре (публичная)
   * @type {Observable<string[]>}
   * @memberof BaseSidebar
   */
  public itemIdsToShow$: Observable<string[]> = this.itemIdsToShow.asObservable();

  /**
   * Событие установки id элементов для отображения в сайдбаре
   * @param {string[]} itemIds id элементов
   * @memberof BaseSidebar
   */
  public emitSettingItemIdToShow(itemIds: string[]): void {
    this.itemIdsToShowValue = itemIds;
    this.itemIdsToShow.next(itemIds);
  }
}