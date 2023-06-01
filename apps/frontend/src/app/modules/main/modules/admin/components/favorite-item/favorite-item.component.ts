import { Component, Input } from '@angular/core';
import { Product } from '@core/entities';

/**
 * Компонент избранного товара
 * @export
 * @class FavoriteItemComponent
 */
@Component({
  selector: 'admin-favorite-item',
  templateUrl: './favorite-item.component.html',
  styleUrls: ['./favorite-item.component.scss']
})
export class FavoriteItemComponent {
  /**
   * Товар
   * @type {(Product | null)}
   * @memberof FavoriteItemComponent
   */
  @Input() public product: Product | null = null;
}
