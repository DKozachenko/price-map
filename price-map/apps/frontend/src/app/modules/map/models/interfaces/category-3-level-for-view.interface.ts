import { Category3Level } from '@core/entities';

/**
 * Интерфейс категории 3 уровня
 * @export
 * @interface ICategory3LevelForView
 * @extends {Category3Level}
 */
export interface ICategory3LevelForView extends Category3Level {
  /**
   * Выбрана ли
   * @type {boolean}
   * @memberof ICategory3LevelForView
   */
  checked: boolean
}