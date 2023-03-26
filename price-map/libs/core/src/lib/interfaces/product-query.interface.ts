import { IPriceQuery, IUserFilter, IRadiusQuery } from '.';

/**
 * Интерфейс запроса для товаров
 * @export
 * @interface IProductQuery
 */
export interface IProductQuery {
  [key: string]: string[] | IUserFilter[] | IPriceQuery | IRadiusQuery,
  /**
   * Id категорий 3 уровня
   * @type {(string[])}
   * @memberof IProductQuery
   */
  category3LevelIds: string[],
  /**
   * Фильтры
   * @type {(IUserFilter[])}
   * @memberof IProductQuery
   */
  filters: IUserFilter[],
  /**
   * Цена
   * @type {IPriceQuery}
   * @memberof IProductQuery
   */
  price: IPriceQuery,
  /**
   * Радиус
   * @type {IRadiusQuery}
   * @memberof IProductQuery
   */
  radius: IRadiusQuery
}
