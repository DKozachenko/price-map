import { Component, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { NotificationService, WebSocketService } from '../../../../services';
import { ProductService } from '../../services';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ExternalEvents, ProductEvents } from '@core/enums';
import { delay } from 'rxjs';

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
export class RouteReviewComponent implements OnInit {
  /**
   * Товары, по которым нужно построить маршрут
   * @type {Product[]}
   * @memberof RouteReviewComponent
   */
  public products: Product[] = [];

  /**
   * Свернут ли компонент
   * @type {boolean}
   * @memberof RouteReviewComponent
   */
  public isCollapsed: boolean = true;

  /**
   * Получение массива координат
   * @private
   * @return {*}  {ICoordinates[]} массив координат
   * @memberof RouteReviewComponent
   */
  private getCoordinates(): ICoordinates[] {
    return this.products.map((product: Product) => ({
      latitude: product.shop.coordinates.latitude,
      longitude: product.shop.coordinates.longitude
    }));
  }

  constructor(private readonly productsService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(ProductEvents.GetProductFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Product>>(ProductEvents.GetProductSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product>) => {
        this.products.push(response.data);
        this.productsService.productAction$.next({ id: response.data.id, action: 'route', direction: 'add' });
      });

    this.productsService.addProductIdToRoute$
      .pipe(untilDestroyed(this))
      .subscribe((id: string) => this.webSocketService.emit<string>(ProductEvents.GetProductAttempt, id));

    this.productsService.deleteProductIdFromRoute$
      .pipe(untilDestroyed(this))
      .subscribe((id: string) => {
        this.products = this.products.filter((product: Product) => product.id !== id);
        this.productsService.productAction$.next({ id, action: 'route', direction: 'remove' });
      });
  }
  /**
   * Построение маршрута
   * @memberof RouteReviewComponent
   */
  public buildRoute(): void {
    const coordinates: ICoordinates[] = this.getCoordinates();
    this.webSocketService.emit<ICoordinates[]>(ExternalEvents.BuildRouteAttempt, coordinates);
  }

  /**
   * Свернуть развернуть компонент
   * @memberof RouteReviewComponent
   */
  public toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * Функция trackBy для товаров
   * @param {number} index индекс
   * @param {Product} item товар
   * @return {*}  {string} id товара
   * @memberof RouteReviewComponent
   */
  public trackByProductFn(index: number, item: Product): string {
    return item.id ?? index;
  }
}
