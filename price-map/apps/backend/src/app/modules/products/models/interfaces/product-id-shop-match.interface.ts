import { Shop } from "@core/entities";

/**
 * Интерфейс сопоставления id товара и магазина
 * @export
 * @interface IProductIdShopMatch
 */
export interface IProductIdShopMatch {
  [key: string]: string | Shop
  /**
   * Id товара
   * @type {string}
   * @memberof IProductIdShopMatch
   */
  productId: string,
  /**
   * Магазин
   * @type {Shop}
   * @memberof IProductIdShopMatch
   */
  shop: Shop
}