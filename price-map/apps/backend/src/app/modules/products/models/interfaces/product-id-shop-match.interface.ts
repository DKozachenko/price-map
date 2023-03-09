import { Shop } from "@core/entities";

/**
 * Интерфейс сопоставления id товара и магазина
 * @export
 * @interface IProductIdShopMatch
 */
export interface IProductIdShopMatch {
  [key: string]: string | Omit<Shop, 'id'>,
  /**
   * Id товара
   * @type {string}
   * @memberof IProductIdShopMatch
   */
  productId: string,
  /**
   * Магазин
   * @type {Omit<Shop, 'id'>}
   * @memberof IProductIdShopMatch
   */
  shop: Omit<Shop, 'id'>
}