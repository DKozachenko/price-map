import { ActionName, ActionDirection } from '../types';

/**
 * Интерфейс действие
 * @export
 * @interface IAction
 */
export interface IAction {
  [key: string]: string | ActionName | ActionDirection,
  /**
   * Id элемента, с которым произошло какое-то действие
   * @type {string}
   * @memberof IAction
   */
  id: string,
  /**
   * Название
   * @type {ActionName}
   * @memberof IAction
   */
  name: ActionName,
  /**
   * Направление
   * @type {ActionDirection}
   * @memberof IAction
   */
  direction: ActionDirection
}