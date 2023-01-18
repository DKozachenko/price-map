import { FilterType } from '../types';

/**
 * Интерфейс фильтра
 * @export
 * @interface IFilter
 */
export interface IFilter {
  [key: string]: string | FilterType | string[] | number[],
  /**
   * Название
   * @type {string}
   * @memberof IFilter
   */
  name: string,
  /**
   * Тип
   * @type {FilterType}
   * @memberof IFilter
   */
  type: FilterType,
  /**
   * Значения
   * @type {(string[] | number[])}
   * @memberof IFilter
   */
  values: string[] | number[]
}