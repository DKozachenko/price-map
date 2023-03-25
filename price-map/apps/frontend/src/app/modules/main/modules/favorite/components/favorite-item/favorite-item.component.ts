import { Component, Input } from '@angular/core';
import { Product } from '@core/entities';
import { UserEvents } from '@core/enums';
import { UntilDestroy } from '@ngneat/until-destroy';
import { WebSocketService, ProductService } from '../../../../../../services';

@UntilDestroy()
@Component({
  selector: 'favorite-favorite-item',
  templateUrl: './favorite-item.component.html',
  styleUrls: ['./favorite-item.component.scss']
})
export class FavoriteItemComponent {
  @Input() product: Product | null = null;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly productService: ProductService) {}

  public remove(): void {
    this.productService.removeFavoriteProductId(this.product?.id ?? '');
    this.webSocketService.emit<string[]>(UserEvents.UpdateFavoriteProductsAttempt, [...this.productService.getFavoriteProductIds()]);
  }
}
