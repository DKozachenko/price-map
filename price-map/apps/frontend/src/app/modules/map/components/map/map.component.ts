import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { IResponseCallback } from '../../../../models/interfaces';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductService } from '../../services';
import { ExternalEvents, ProductEvents } from '@core/enums';

/**
 * Компонент карты
 * @export
 * @class MapComponent
 * @implements {AfterViewInit}
 * @implements {OnDestroy}
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  /**
   * Ссылка на компонент карты
   * @private
   * @type {ElementRef<HTMLElement>}
   * @memberof MapComponent
   */
  @ViewChild('map') private mapContainer!: ElementRef<HTMLElement>;

  /**
   * Показывать ли компонент маршрута
   * @type {boolean}
   * @memberof MapComponent
   */
  public isShowRouteReview: boolean = false;

  /**
   * Колбэк, срабатывающий при удачном получении товаров
   * @private
   * @param {IResponseData<Product[]>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<Product[]>>}
   * @memberof MapComponent
   */
  private onGetProductsSuccessed: IResponseCallback<IResponseData<Product[]>> 
    = (response: IResponseData<Product[]>) => {
      this.mapService.addProducts(response.data);
    }; 

  /**
   * Колбэк, срабатывающий при неудачной попытке получении товаров
   * @private
   * @param {IResponseData<null[]>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<null[]>>}
   * @memberof MapComponent
   */
  private onGetProductsFailed: IResponseCallback<IResponseData<null[]>> = (response: IResponseData<null[]>) => {
    this.notificationService.showError(response.message);
  };

  /**
   * Колбэк, срабатывающий при удачном построении маршрута
   * @private
   * @param {IResponseData<number[][]>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<number[][]>>}
   * @memberof MapComponent
   */
  private onBuildRouteSuccessed: IResponseCallback<IResponseData<number[][]>> 
    = (response: IResponseData<number[][]>) => {
      this.mapService.addRoute(response.data);
    };

  /**
   * Колбэк, срабатывающий при неудачном построении маршрута
   * @private
   * @param {IResponseData<null>} response
   * @type {IResponseCallback<IResponseData<null>>}
   * @memberof MapComponent
   */
  private onBuildRouteFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  };

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketSevice.on(ProductEvents.GetProductsFailed, this.onGetProductsFailed);
    this.webSocketSevice.on(ProductEvents.GetProductsSuccessed, this.onGetProductsSuccessed);
    this.webSocketSevice.on(ExternalEvents.BuildRouteSuccessed, this.onBuildRouteSuccessed);
    this.webSocketSevice.on(ExternalEvents.BuildRouteFailed, this.onBuildRouteFailed);

    this.productService.productIdsToRoute$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((data) => {
        this.isShowRouteReview = data.size > 0;
      });

    this.filterService.chechedCategory3LevelIds$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((data: Set<string>) => {
        this.webSocketSevice.emit<string[]>(ProductEvents.GetProductsAttempt, [...data]);
      });

    this.filterService.filterValues$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((data) => console.log('filterValues', data));
  }

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
