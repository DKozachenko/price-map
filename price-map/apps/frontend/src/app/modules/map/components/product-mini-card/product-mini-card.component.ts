import { Component, Input } from '@angular/core';
import { ProductService } from '../../services';

@Component({
  selector: 'map-product-mini-card',
  templateUrl: './product-mini-card.component.html',
  styleUrls: ['./product-mini-card.component.scss'],
})
export class ProductMiniCardComponent {
  @Input() public product: any;

  constructor(private readonly productService: ProductService) {}

  public deleteProductFromRoute(): void {
    this.productService.removeProductIdFromRoute(this.product.id);
  }
}
