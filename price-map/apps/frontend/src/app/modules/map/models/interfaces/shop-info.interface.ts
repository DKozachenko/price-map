import { Shop } from '@core/entities';

export interface IShopInfo extends Omit<Shop, | 'coordinates' | 'products'> {
  productNumber: string
}
