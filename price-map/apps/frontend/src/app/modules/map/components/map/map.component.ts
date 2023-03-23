import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Product, Shop } from '@core/entities';
import { IResponseData, IProductQuery, IPriceQuery } from '@core/interfaces';
import { NotificationService, ProductService, WebSocketService } from '../../../../services';
import { FilterService, MapService, ShopService } from '../../services';
import { ExternalEvents, ProductEvents, ShopEvents } from '@core/enums';
import { LayerType } from '../../models/types';
import { customCombineLastest } from '../operators';
import { debounceTime } from 'rxjs';

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
  public isShowProductsSidebar: boolean = false;
  public isShowShopsSidebar: boolean = false;
  public isLoading: boolean = false;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService,
    private readonly shopService: ShopService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(ProductEvents.GetProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<Product[]>>(ProductEvents.GetProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product[]>) => {
        this.mapService.addProducts(response.data);
        this.isLoading = false;
      });

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

    this.webSocketService.on<IResponseData<IPriceQuery>>(ProductEvents.GetPriceRangeSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<IPriceQuery>) => {
        this.filterService.initialPriceQuery$.next(response.data);
      });

    this.webSocketService.on<IResponseData<IPriceQuery>>(ProductEvents.GetPriceRangeFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<IPriceQuery>) => this.notificationService.showError(response.message));

    this.webSocketService.emit<null>(ProductEvents.GetPriceRangeAttempt, null);

    this.mapService.currentLayer$
      .pipe(untilDestroyed(this))
      .subscribe((layer: LayerType) => {
        this.isShowFilter = layer === 'products';
        this.isShowRouteReview = layer === 'products';
        this.mapService.removeAllLayers();
        if (layer === 'shops') {
          this.webSocketService.emit<null>(ShopEvents.GetShopsAttempt);
          this.mapService.removePriceControl();
          this.mapService.removeRadiusControl();
          this.isShowProductsSidebar = false;
        } else {
          this.mapService.addPriceControl();
          this.mapService.addRadiusControl();
          this.isShowShopsSidebar = false;
        }
      });

    this.productService.productIdsToRoute$
      .pipe(untilDestroyed(this))
      .subscribe((data: Set<string>) => this.isShowRouteReview = data.size > 0);

    this.productService.productIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.isShowProductsSidebar = !!data.length);

    this.shopService.shopIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.isShowShopsSidebar = !!data.length);

    this.filterService.allFilters$
      .pipe(untilDestroyed(this))
      .subscribe(([ids, filters, priceQuery, radiusQuery]: any[]) => {
        this.webSocketService.emit<IProductQuery>(ProductEvents.GetProductsAttempt, {
          category3LevelIds: ids ? [...ids] : [],
          filters: filters ?? [],
          price: priceQuery ?? { max: null, min: null },
          radius: radiusQuery ?? { center: null, distance: null }
        });
        this.isLoading = true;
      });
  }

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
