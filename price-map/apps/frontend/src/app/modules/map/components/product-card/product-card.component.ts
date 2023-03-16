import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Product } from '@core/entities';
import { ProductService } from '../../services';

/**
 * Компонент карточки товара для отображения в маршруте
 * @export
 * @class ProductMiniCardComponent
 */
@Component({
  selector: 'map-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {

  @Input() public product: Product | null = null;;

}
