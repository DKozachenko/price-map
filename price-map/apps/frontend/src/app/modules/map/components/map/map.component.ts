import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { NotificationService, WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductService } from '../../services';
import { ExternalEvents, ProductEvents } from '@core/enums';
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

    this.productService.productIdsToRoute$
      .pipe(untilDestroyed(this))
      .subscribe((data) => this.isShowRouteReview = data.size > 0);

    this.filterService.chechedCategory3LevelIds$
      .pipe(untilDestroyed(this))
      .subscribe((data: Set<string>) => this.webSocketService.emit<string[]>(ProductEvents.GetProductsAttempt, [...data]));

    this.filterService.filterValues$
      .pipe(
        debounceTime(400),
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
