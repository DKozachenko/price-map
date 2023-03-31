import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, Input, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { WebSocketService } from './../../../../../../services';
import { UserEvents } from '@core/enums';
import { IAction } from '../../models/interfaces';
import { NbDialogService } from '@nebular/theme';
import { ProductInfoModalComponent } from '..';
import { ProductService } from '../../../../services';

/**
 * Компонент карточки товара
 * @export
 * @class ProductCardComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'map-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  /**
   * Товар
   * @type {(Product | null)}
   * @memberof ProductCardComponent
   */
  @Input() public product: Product | null = null;

  /**
   * Добавлен ли товар в маршруте
   * @type {boolean}
   * @memberof ProductCardComponent
   */
  public isInRoute: boolean = false;

  /**
   * Добавлен ли товар в избранное
   * @type {boolean}
   * @memberof ProductCardComponent
   */
  public isFavorite: boolean = false;

  constructor (private readonly productService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly dialogService: NbDialogService) {}

  public ngOnInit(): void {
    this.isInRoute = [...this.productService.getProductIdsToRoute()].includes(this.product?.id ?? '');
    this.isFavorite = [...this.productService.getFavoriteProductIds()].includes(this.product?.id ?? '');

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

  /**
   * Добавить / убрать из маршрута
   * @memberof ProductCardComponent
   */
  public routeAction(): void {
    if (!this.isInRoute) {
      this.productService.emitAdditionProductIdToRoute(this.product?.id ?? '');
    } else {
      this.productService.emitRemovingProductIdFromRoute(this.product?.id ?? '');
    }
  }

  /**
   * Добавить / удалить из избранного
   * @memberof ProductCardComponent
   */
  public favoriteAction(): void {
    if (!this.isFavorite) {
      this.productService.addFavoriteProductId(this.product?.id ?? '');
    } else {
      this.productService.removeFavoriteProductId(this.product?.id ?? '');
    }

    this.webSocketService.emit<string[]>(UserEvents.UpdateFavoriteProductsAttempt, [...this.productService.getFavoriteProductIds()]);
  }

  /**
   * Открытие модального окна с подробной информацией
   * @memberof ProductCardComponent
   */
  public openInfoDialog(): void {
    this.dialogService.open<ProductInfoModalComponent>(ProductInfoModalComponent, {
      context: {
        product: this.product
      },
    });
  }
}
