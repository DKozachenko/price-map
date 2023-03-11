import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Product, Shop } from '@core/entities';
import { IResponseData, IProductQuery, IPriceQuery } from '@core/interfaces';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductService } from '../../services';
import { ExternalEvents, ProductEvents, ShopEvents } from '@core/enums';
import { debounceTime } from 'rxjs';
import { LayerType } from '../../models/types';
import { customCombineLastest } from '../operators';

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

  public isShowFilter: boolean = true;



  constructor(private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(ProductEvents.GetProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Product[]>>(ProductEvents.GetProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product[]>) => this.mapService.addProducts(response.data));

    this.webSocketService.on<IResponseData<number[][]>>(ExternalEvents.BuildRouteSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<number[][]>) => this.mapService.addRoute(response.data));

    this.webSocketService.on<IResponseData<null>>(ExternalEvents.BuildRouteFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<null>>(ShopEvents.GetShopsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Shop[]>>(ShopEvents.GetShopsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Shop[]>) => this.mapService.addShops(response.data));

    this.mapService.currentLayer$
      .pipe(untilDestroyed(this))
      .subscribe((layer: LayerType) => {
        this.isShowFilter = layer === 'products';
        this.isShowRouteReview = layer === 'products';
        this.mapService.removeAllLayers();
        if (layer === 'shops') {
          this.webSocketService.emit<null>(ShopEvents.GetShopsAttempt);
        }
      });


    this.productService.productIdsToRoute$
      .pipe(untilDestroyed(this))
      .subscribe((data) => this.isShowRouteReview = data.size > 0);

    customCombineLastest([
      this.filterService.chechedCategory3LevelIds$,
      this.filterService.currentMaxPrice$
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([ids, priceQuery]: any[]) => {
        this.webSocketService.emit<IProductQuery>(ProductEvents.GetProductsAttempt, {
          category3LevelIds: [...ids],
          filters: [],
          price: priceQuery ?? { max: null, min: null }
        });
      });
  }

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
