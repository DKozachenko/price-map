import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Product, Shop } from '@core/entities';
import { IResponseData, IProductQuery, IPriceQuery, IUserFilter, IRadiusQuery, IOsrmData } from '@core/interfaces';
import { NotificationService, SettingsService, WebSocketService } from '../../../../../../services';
import { FilterService, MapService, RouteService, ShopService } from '../../services';
import { ExternalEvents, ProductEvents, ShopEvents } from '@core/enums';
import { LayerType } from '../../models/types';
import { ProductService } from '../../../../services';
import { delay, map } from 'rxjs';

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
   * Показывать ли фильтр
   * @type {boolean}
   * @memberof MapComponent
   */
  public isShowFilter: boolean = true;

  /**
   * Показывать ли боковую панель с товарами
   * @type {boolean}
   * @memberof MapComponent
   */
  public isShowProductsSidebar: boolean = false;

  /**
   * Показывать ли боковую панель с магазинами
   * @type {boolean}
   * @memberof MapComponent
   */
  public isShowShopsSidebar: boolean = false;

  /**
   * Показывать ли уведомление о возиможности скачать подробный маршрут
   * @type {boolean}
   * @memberof MapComponent
   */
  public isShowRouteDownloadNotification: boolean = false;

  /**
   * Происходит ли загрузка
   * @type {boolean}
   * @memberof MapComponent
   */
  public isLoading: boolean = false;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService,
    private readonly shopService: ShopService,
    private readonly settingsService: SettingsService,
    private readonly routeService: RouteService) {}

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

    this.webSocketService.on<IResponseData<IOsrmData>>(ExternalEvents.BuildRouteSuccessed)
      .pipe(
        map((response: IResponseData<IOsrmData>) => {
          this.mapService.addRoute(response.data.coordinates);
          this.isLoading = false;

          this.routeService.emitLegs(response.data.legs);
          this.isShowRouteDownloadNotification = true;
          return;
        }),
        delay(5000),
        untilDestroyed(this)
      )
      .subscribe(() => this.isShowRouteDownloadNotification = false);

    this.webSocketService.on<IResponseData<null>>(ExternalEvents.BuildRouteFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<null>>(ShopEvents.GetShopsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<Shop[]>>(ShopEvents.GetShopsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Shop[]>) => {
        this.mapService.addShops(response.data);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<IPriceQuery>>(ProductEvents.GetPriceRangeSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<IPriceQuery>) => {
        this.filterService.emitSettingInitialPriceQuery(response.data);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<IPriceQuery>>(ProductEvents.GetPriceRangeFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<IPriceQuery>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.isLoading = true;
    this.webSocketService.emit<null>(ProductEvents.GetPriceRangeAttempt, null);

    this.mapService.currentLayer$
      .pipe(untilDestroyed(this))
      .subscribe((layer: LayerType) => {
        this.isShowFilter = layer === 'products';
        this.isShowRouteReview = layer === 'products';
        this.mapService.removeAllLayers();
        if (layer === 'shops') {
          this.isLoading = true;
          this.webSocketService.emit<null>(ShopEvents.GetShopsAttempt);
          this.mapService.removePriceControl();
          this.mapService.removeRadiusControl();
          this.mapService.removeOnlyFavoriteControl();
          this.isShowProductsSidebar = false;
          this.isShowRouteDownloadNotification = false;
        } else {
          this.mapService.addPriceControl();
          this.mapService.addRadiusControl();
          this.mapService.addOnlyFavoriteControl();
          this.isShowShopsSidebar = false;
        }
      });

    this.productService.productIdsToRoute$
      .pipe(untilDestroyed(this))
      .subscribe((data: Set<string>) => this.isShowRouteReview = data.size > 0);

    this.productService.itemIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => {
        this.isShowProductsSidebar = !!data.length;
        this.isShowFilter = !data.length;
      });

    this.shopService.itemIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.isShowShopsSidebar = !!data.length);

    this.filterService.allFilters$
      .pipe(untilDestroyed(this))
      .subscribe(([
        categoryIds, 
        filters, 
        priceQuery, 
        radiusQuery,
        isOnlyFavorite
      ]: [
        Set<string>, 
        IUserFilter[], 
        IPriceQuery, 
        IRadiusQuery,
        boolean
      ]) => {
        this.webSocketService.emit<IProductQuery>(ProductEvents.GetProductsAttempt, {
          category3LevelIds: categoryIds ? [...categoryIds] : [],
          filters: filters && categoryIds.size === 1 ? filters : [],
          price: priceQuery ?? { max: null, min: null },
          radius: radiusQuery ?? { center: null, distance: null },
          userId: isOnlyFavorite ? this.settingsService.getUser().id : null
        });
        this.isLoading = true;
      });
  }

  /**
   * Установка загрузки
   * @param {boolean} state состояние загрузки
   * @memberof MapComponent
   */
  public setLoading(state: boolean): void {
    this.isLoading = state;
  }

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
