import { Shop } from '@core/entities';

export interface IShopInfo extends  Omit<Shop, 'schedule' | 'coordinates' | 'organization' | 'products'> {
  productNumber: string
}
