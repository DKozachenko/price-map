import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { ProductService } from '../../services';
import { WebSocketService } from './../../../../services';
import { IResponseData } from '@core/interfaces';
import { ProductEvents } from '@core/enums';

@UntilDestroy()
@Component({
  selector: 'map-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() public product: Product | null = null;
  public isInRoute: boolean = false;

  constructor (private readonly productService: ProductService) {}

  public ngOnInit(): void {
    this.isInRoute = [...this.productService.productIdsToRoute].includes(this.product?.id ?? '');

    this.productService.productAction$
      .pipe(untilDestroyed(this))
      .subscribe((data: { id: string, action: string, direction: string }) => {
        if (data.id === this.product?.id) {
          if (data.action === 'route') {
            this.isInRoute = data.direction === 'add';
          }
        }
      })
  }

  public routeAction(): void {
    if (!this.isInRoute) {
      this.productService.addProductIdToRoute(this.product?.id ?? '');
    } else {
      this.productService.deleteProductIdFromRoute(this.product?.id ?? '');
    }
  }
}
