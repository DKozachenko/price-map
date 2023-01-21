import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '@core/entities';
import { NotificationService, WebSocketService } from '../../../../services';
import { MapService, ProductService } from '../../services';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IResponseCallback } from '../../../../models/interfaces';
import { Coordinates } from 'maplibre-gl';

/**
 * Компонент отображения товаров, по которым нужно построить маршрут
 * @export
 * @class RouteReviewComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@UntilDestroy()
@Component({
  selector: 'price-map-route-review',
  templateUrl: './route-review.component.html',
  styleUrls: ['./route-review.component.scss'],
})
export class RouteReviewComponent implements OnInit, OnDestroy {
  private onGetProductSuccessed: IResponseCallback<IResponseData<Product>> = (response: IResponseData<Product>) => {
    this.products.push(response.data);
  }

  private onGetProductFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  }

  /**
   * Товары, по которым нужно построить маршрут
   * @type {Product[]}
   * @memberof RouteReviewComponent
   */
  public products: Product[] = [];

  constructor(private readonly productsService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketService.on('get product successed', this.onGetProductSuccessed)
    this.webSocketService.on('get product failed', this.onGetProductFailed)

    this.productsService.addProductIdToRoute$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((id: string) => {
        this.webSocketService.emit<string>('get product attempt', id);
      })

    this.productsService.deleteProductIdFromRoute$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((id: string) => {
        this.products = this.products.filter((product: Product) => product.id !== id);
      })
  }

  public ngOnDestroy(): void {
    this.webSocketService.removeEventListener('get product successed');
  }

  public getCoordinates(): ICoordinates[] {
    return this.products.map((product: Product) => {
      return {
        latitude: product.shop.coordinates.longitude,
        longitude: product.shop.coordinates.latitude
      };
    });
  }

  public buildRoute(): void {
    const coordinates: ICoordinates[] = this.getCoordinates();

    this.webSocketService.emit<ICoordinates[]>('build route attempt', coordinates);
  }
}
