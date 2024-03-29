import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Product } from '@core/entities';
import { NotificationService, WebSocketService } from '../../../../../../services';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ExternalEvents, ProductEvents } from '@core/enums';
import { ProductService } from '../../../../services';
import { MapService } from '../../services';

/**
 * Компонент отображения товаров, по которым нужно построить маршрут
 * @export
 * @class RouteReviewComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'map-route-review',
  templateUrl: './route-review.component.html',
  styleUrls: ['./route-review.component.scss'],
})
export class RouteReviewComponent implements OnInit {
  /**
   * Эмиттер состояния загрузки
   * @private
   * @type {EventEmitter<boolean>}
   * @memberof RouteReviewComponent
   */
  @Output() private loadingState: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  constructor(private readonly productsService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly mapService: MapService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(ProductEvents.GetProductFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Product>>(ProductEvents.GetProductSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product>) => {
        this.products.push(response.data);
        this.productsService.emitAdditionProductAction({ id: response.data.id, name: 'route', direction: 'add' });
      });

    this.productsService.addProductIdToRoute$
      .pipe(untilDestroyed(this))
      .subscribe((id: string) => this.webSocketService.emit<string>(ProductEvents.GetProductAttempt, id));

    this.productsService.deleteProductIdFromRoute$
      .pipe(untilDestroyed(this))
      .subscribe((id: string) => {
        this.products = this.products.filter((product: Product) => product.id !== id);
        this.productsService.emitAdditionProductAction({ id, name: 'route', direction: 'remove' });
      });
  }

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

  /**
   * Построение маршрута
   * @memberof RouteReviewComponent
   */
  public buildRoute(): void {
    const coordinates: ICoordinates[] = this.getCoordinates();
    this.loadingState.emit(true);
    this.mapService.removeRouteLayer();
    this.webSocketService.emit<ICoordinates[]>(ExternalEvents.BuildRouteAttempt, coordinates);
  }

  /**
   * Смена состояния комопнента (свернут /  развернут)
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
