import { IPriceQuery, IUserFilter } from '.';

/**
 * Интерфейс запроса для товаров
 * @export
 * @interface IProductQuery
 */
export interface IProductQuery {
  [key: string]: string[] | IUserFilter[] | IPriceQuery,
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
  price: IPriceQuery
}
