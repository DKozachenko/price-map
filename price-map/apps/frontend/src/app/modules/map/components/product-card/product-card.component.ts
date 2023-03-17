import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, Input, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { ProductService } from '../../services';
import { SettingsService, WebSocketService } from './../../../../services';
import { UserEvents } from '@core/enums';
import { IAction } from '../../models/interfaces';

@UntilDestroy()
@Component({
  selector: 'map-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() public product: Product | null = null;
  public isInRoute: boolean = false;
  public isFavorite: boolean = false;

  constructor (private readonly productService: ProductService,
    private readonly webSocketService: WebSocketService) {}

  public ngOnInit(): void {
    this.isInRoute = [...this.productService.productIdsToRoute].includes(this.product?.id ?? '');
    this.isFavorite = [...this.productService.favoriteProductIds].includes(this.product?.id ?? '');

    this.productService.productAction$
      .pipe(untilDestroyed(this))
      .subscribe((action: IAction) => {
        if (action.id === this.product?.id) {
          if (action.name === 'route') {
            this.isInRoute = action.direction === 'add';
          }
          if (action.name === 'favorite') { 
            this.isFavorite = action.direction === 'add';
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

  public favoriteAction(): void {
    if (!this.isFavorite) {
      this.productService.favoriteProductIds.add(this.product?.id ?? '');
    } else {
      this.productService.favoriteProductIds.delete(this.product?.id ?? '');
    }

    this.webSocketService.emit<string[]>(UserEvents.UpdateFavoriteProductsAttempt, [...this.productService.favoriteProductIds]);
  }
}
