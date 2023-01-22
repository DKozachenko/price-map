import { Component, Input } from '@angular/core';
import { Product } from '@core/entities';
import { ProductService } from '../../services';

/**
 * Компонент карточки товара для отображения в маршруте
 * @export
 * @class ProductMiniCardComponent
 */
@Component({
  selector: 'map-product-mini-card',
  templateUrl: './product-mini-card.component.html',
  styleUrls: ['./product-mini-card.component.scss'],
})
export class ProductMiniCardComponent {
  //TODO: почему-то ломается, если оставить просто Product
  /**
   * Товар
   * @type {Product}
   * @memberof ProductMiniCardComponent
   */
  @Input() public product: Partial<Product>;

  constructor(private readonly productService: ProductService) {}

  /**
   * Удаление товара из маршрута
   * @memberof ProductMiniCardComponent
   */
  public deleteProductFromRoute(): void {
    this.productService.deleteProductIdFromRoute(this.product.id ?? '');
  }
}
