import { Product } from "@core/entities";

/**
 * Интерфейс товара с названиями вместо внешних ключей
 * @export
 * @interface IProductWithNames
 * @extends {Product}
 */
export interface IProductWithNames extends Product {
  /**
   * Название магазина
   * @type {string}
   * @memberof IProductWithNames
   */
  shopName: string, 
  /**
   * Название категории 3 уровня
   * @type {string}
   * @memberof IProductWithNames
   */
  category3LevelName: string 
}