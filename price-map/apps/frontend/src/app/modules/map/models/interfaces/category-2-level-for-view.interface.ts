import { Category2Level } from '@core/entities';
import { ICategory3LevelForView } from '.';

/**
 * Интрефейс категории 2 уровня
 * @export
 * @interface ICategory2LevelForView
 * @extends {Omit<Category2Level, 'categories3Level'>}
 */
export interface ICategory2LevelForView extends Omit<Category2Level, 'categories3Level'> {
  /**
   * Выбрана ли
   * @type {boolean}
   * @memberof ICategory2LevelForView
   */
  checked: boolean,
  /**
   * Показывать категории 3 уровня
   * @type {boolean}
   * @memberof ICategory2LevelForView
   */
  showCategories3Level: boolean,
  /**
   * Категории 3 уровня
   * @type {ICategory3LevelForView[]}
   * @memberof ICategory2LevelForView
   */
  categories3Level: ICategory3LevelForView[]
}