import { Product } from '@core/entities';

/**
 * Интерфейс информации о товаре для карты
 * @export
 * @interface IProductInfo
 * @extends {(Omit<Product, 'characteristics' | 'imagePath' | 'shop' | 'category3Level' | 'users' | 'price'>)}
 */
export interface IProductInfo extends
  Omit<Product, 'characteristics' | 'imagePath' | 'shop' | 'category3Level' | 'users' | 'price'> {
  /**
   * Цена
   * @type {string}
   * @memberof IProductInfo
   */
  price: string
}
