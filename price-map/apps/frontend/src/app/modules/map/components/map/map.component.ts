import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductService } from '../../services';

@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  public isShowRouteReview: boolean = false;

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productService: ProductService) {}

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
    this.mapService.loadProductImage();
    this.mapService.addControl();
    this.mapService.setClicks();
    // console.log(this.mapService.map.loaded())
  }

  public ngOnInit(): void {
    this.webSocketSevice.socket.on('get products failed', (response) => {
      console.log(123);
      console.log('on get products failed', response);
    });

    this.webSocketSevice.socket.on('get products successed', (response) => {
      console.log('on get products successed', response);
      this.mapService.addSource(response.data);
    });

    this.webSocketSevice.emit<null>('get products attempt');

    this.webSocketSevice.socket.on('build route successed', (response) => {
      console.log('resp', response)
      this.mapService.addLineSource(response.data);
    });

    // this.mapService.clicks$.subscribe((data) => console.log('clicks', data));
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
