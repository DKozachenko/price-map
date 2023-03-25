import { Component, Input } from '@angular/core';
import { Product } from '@core/entities';

@Component({
  selector: 'admin-favorite-item',
  templateUrl: './favorite-item.component.html',
  styleUrls: ['./favorite-item.component.scss']
})
export class FavoriteItemComponent {
  @Input() product: Product | null = null;
}
