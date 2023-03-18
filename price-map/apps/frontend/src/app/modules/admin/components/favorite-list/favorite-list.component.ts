import { Component, Input } from '@angular/core';
import { Product } from '@core/entities';

@Component({
  selector: 'users-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss'],
})
export class FavoriteListComponent {
  @Input() public favoriteProducts: Product[] = [];

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
