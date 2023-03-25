import { Injectable } from '@angular/core';
import { BaseSidebar } from '../../../../../classes';
import { ReplaySubject} from 'rxjs';

/**
 * Сервис-стор для магазинов
 * @export
 * @class ShopService
 * @extends {BaseSidebar}
 */
@Injectable()
export class ShopService extends BaseSidebar {
  // public shopIdsToShow$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  // public productAction$: Subject<IAction> = new Subject<IAction>();

}