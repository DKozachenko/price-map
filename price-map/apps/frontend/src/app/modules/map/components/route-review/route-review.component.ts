import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '@core/entities';
import { NotificationService, WebSocketService } from '../../../../services';
import { ProductService } from '../../services';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IResponseCallback } from '../../../../models/interfaces';
import { ExternalEvents, ProductEvents } from '@core/enums';

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
  /**
   * Товары, по которым нужно построить маршрут
   * @type {Product[]}
   * @memberof RouteReviewComponent
   */
  public products: Product[] = [];

  /**
   * Колбэк, срабатывающий при успешном получении товара
   * @private
   * @param {IResponseData<Product>} response ответ сервера
   * @type {IResponseCallback<IResponseData<Product>>}
   * @memberof RouteReviewComponent
   */
  private onGetProductSuccessed: IResponseCallback<IResponseData<Product>> = (response: IResponseData<Product>) => {
    this.products.push(response.data);
  };

  /**
   * Колбэк, срабатывающий при успешном получении товара
   * @private
   * @param {IResponseData<null>} response ответ сервера
   * @type {IResponseCallback<IResponseData<null>>}
   * @memberof RouteReviewComponent
   */
  private onGetProductFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  };

  /**
   * Получение массива координат
   * @private
   * @return {*}  {ICoordinates[]} массив координат
   * @memberof RouteReviewComponent
   */
  private getCoordinates(): ICoordinates[] {
    return this.products.map((product: Product) => ({
      latitude: product.shop.coordinates.longitude,
      longitude: product.shop.coordinates.latitude
    }));
  }

  constructor(private readonly productsService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketService.on(ProductEvents.GetProductSuccessed, this.onGetProductSuccessed);
    this.webSocketService.on(ProductEvents.GetProductFailed, this.onGetProductFailed);

    this.productsService.addProductIdToRoute$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((id: string) => {
        this.webSocketService.emit<string>(ProductEvents.GetProductAttempt, id);
      });

    this.productsService.deleteProductIdFromRoute$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((id: string) => {
        this.products = this.products.filter((product: Product) => product.id !== id);
      });
  }

  public ngOnDestroy(): void {
    this.webSocketService.removeEventListener(ProductEvents.GetProductSuccessed);
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
