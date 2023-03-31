import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@core/entities';
import { UserEvents } from '@core/enums';
import { UntilDestroy } from '@ngneat/until-destroy';
import { WebSocketService } from '../../../../../../services';
import { ProductService } from '../../../../services';

/**
 * Компонент избранного товара
 * @export
 * @class FavoriteItemComponent
 */
@UntilDestroy()
@Component({
  selector: 'favorite-favorite-item',
  templateUrl: './favorite-item.component.html',
  styleUrls: ['./favorite-item.component.scss']
})
export class FavoriteItemComponent {
  /**
   * Эмиттер состояния загрузки
   * @private
   * @type {EventEmitter<boolean>}
   * @memberof FavoriteItemComponent
   */
  @Output() private loadingState: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Избранный товар
   * @type {(Product | null)}
   * @memberof FavoriteItemComponent
   */
  @Input() public product: Product | null = null;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly productService: ProductService) {}

  /**
   * Удаление товара из избранного
   * @memberof FavoriteItemComponent
   */
  public remove(): void {
    this.productService.removeFavoriteProductId(this.product?.id ?? '');
    this.loadingState.emit(true);
    this.webSocketService.emit<string[]>(
      UserEvents.UpdateFavoriteProductsAttempt, 
      [...this.productService.getFavoriteProductIds()]
    );
  }
}
