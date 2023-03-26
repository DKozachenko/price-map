import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@core/entities';
import { UserEvents } from '@core/enums';
import { UntilDestroy } from '@ngneat/until-destroy';
import { WebSocketService } from '../../../../../../services';
import { ProductService } from '../../../../services';

@UntilDestroy()
@Component({
  selector: 'favorite-favorite-item',
  templateUrl: './favorite-item.component.html',
  styleUrls: ['./favorite-item.component.scss']
})
export class FavoriteItemComponent {
  @Input() product: Product | null = null;

  @Output() loadingState: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private readonly webSocketService: WebSocketService,
    private readonly productService: ProductService) {}

  public remove(): void {
    this.productService.removeFavoriteProductId(this.product?.id ?? '');
    this.loadingState.emit(true);
    this.webSocketService.emit<string[]>(UserEvents.UpdateFavoriteProductsAttempt, [...this.productService.getFavoriteProductIds()]);
  }
}
