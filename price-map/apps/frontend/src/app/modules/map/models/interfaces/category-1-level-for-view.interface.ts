import { Category1Level } from '@core/entities';
import { ICategory2LevelForView } from '.';

/**
 * Интерфейс категории 1 уровня для отображения
 * @export
 * @interface ICategory1LevelForView
 * @extends {Omit<Category1Level, 'categories2Level'>}
 */
export interface ICategory1LevelForView extends Omit<Category1Level, 'categories2Level'> {
  /**
   * Выбрана ли
   * @type {boolean}
   * @memberof ICategory1LevelForView
   */
  checked: boolean,
  /**
   * Показывать категории 2 уровня
   * @type {boolean}
   * @memberof ICategory1LevelForView
   */
  showCategories2Level: boolean,
  /**
   * Категории 2 уровня
   * @type {ICategory2LevelForView[]}
   * @memberof ICategory1LevelForView
   */
  categories2Level: ICategory2LevelForView[]
}