import { IUserFilter } from '.';

/**
 * Интерфейс запроса для товаров
 * @export
 * @interface IProductQuery
 */
export interface IProductQuery {
  [key: string]: string[] | IUserFilter[] | null,
  /**
   * Id категорий 3 уровня
   * @type {(string[] | null)}
   * @memberof IProductQuery
   */
  category3LevelIds: string[] | null,
  /**
   * Фильтры
   * @type {(IUserFilter[] | null)}
   * @memberof IProductQuery
   */
  filters: IUserFilter[] | null
}
