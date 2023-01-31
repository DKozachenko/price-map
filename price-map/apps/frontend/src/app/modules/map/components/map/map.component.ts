import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Product } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductService } from '../../services';

@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('map') private mapContainer!: ElementRef<HTMLElement>;

  public isShowRouteReview: boolean = false;

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService) {}

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
  }

  public ngOnInit(): void {
    this.webSocketSevice.socket.on('get products failed', (response) => {
      console.log(123);
      console.log('on get products failed', response);
    });

    this.webSocketSevice.socket.on('get products successed', (response: IResponseData<Product[]>) => {
      console.log('on get products successed', response);
      this.mapService.addProducts(response.data);
    });

    this.webSocketSevice.socket.on('build route successed', (response) => {
      console.log('resp', response)
      this.mapService.addRoute(response.data);
    });

    this.productService.productIdsToRoute$.subscribe((data) => {
      console.log('productIdsToRoute', data);
      this.isShowRouteReview = data.size > 0;
    });

    this.filterService.chechedCategory3LevelIds$.subscribe((data: Set<string>) => {
      console.log('chechedCategories3Level', data);
      this.webSocketSevice.emit<string[]>('get products attempt', [...data]);
    });

    this.filterService.filterValues$.subscribe((data) => console.log('filterValues', data));
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
