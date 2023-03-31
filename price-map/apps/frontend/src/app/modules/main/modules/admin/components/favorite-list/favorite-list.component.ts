import { Component, Input } from '@angular/core';
import { Product } from '@core/entities';

/**
 * Компонент списка избранных товаров
 * @export
 * @class FavoriteListComponent
 */
@Component({
  selector: 'admin-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss'],
})
export class FavoriteListComponent {
  /**
   * Избранные товары
   * @type {Product[]}
   * @memberof FavoriteListComponent
   */
  @Input() public favoriteProducts: Product[] = [];

  /**
   * Фукнция trackBy для товаров
   * @param {number} index индекс
   * @param {Product} item значение
   * @return {*}  {string} id товара
   * @memberof FavoriteListComponent
   */
  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
