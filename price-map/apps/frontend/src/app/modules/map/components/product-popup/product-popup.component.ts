import { IProductInfo } from './../../models/interfaces/product-info.interface';
import { Component } from '@angular/core';
import { ProductService } from '../../services';
import { UntilDestroy } from '@ngneat/until-destroy';

/**
 * Компонент попапа товара на карте
 * @export
 * @class ProductPopupComponent
 */
@UntilDestroy()
@Component({
  selector: 'map-product-popup',
  templateUrl: './product-popup.component.html',
  styleUrls: ['./product-popup.component.scss']
})
export class ProductPopupComponent {
  /**
   * Информация о товара
   * @type {IProductInfo}
   * @memberof ProductPopupComponent
   */
  public productInfo: IProductInfo;

  /**
   * Сервис товаров
   * @type {ProductService}
   * @memberof ProductPopupComponent
   */
  public productService: ProductService; 

  /**
   * Добавление id товара в маршрут
   * @memberof ProductPopupComponent
   */
  public addProductIdToRoute(): void {
    this.productService.addProductIdToRoute(this.productInfo.id);
  }
}
