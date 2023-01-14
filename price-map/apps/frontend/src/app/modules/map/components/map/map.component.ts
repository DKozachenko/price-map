import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { distinctUntilChanged } from 'rxjs';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductsService } from '../../services';

@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  public isShowRouteReview: boolean = false;
  public productIdsForRoute: string[] = [];

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productsService: ProductsService) {}

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
    this.mapService.loadProductImage();
    this.mapService.addControl();
    this.mapService.setClicks();
    // console.log(this.mapService.map.loaded())
  }

  public ngOnInit(): void {
    this.webSocketSevice.socket.on('get users failed', (response) => {
      console.log('on get users failed', response);
    });

    this.webSocketSevice.socket.on('get users successed', (response) => {
      console.log('on get users successed', response);
    });

    this.webSocketSevice.addToken();
    this.webSocketSevice.socket.emit('get users attempt', { temp: 1 });

    this.mapService.clicks$.subscribe((data) => console.log('clicks', data))
    this.mapService.productIdsToRoute$.subscribe((data) => {
      console.log('productIdsToRoute', data)
      this.isShowRouteReview = data.size > 0;
      this.productIdsForRoute = [...data];
    })

    this.filterService.chechedCategories3Level$.subscribe((data) => {
      console.log('chechedCategories3Level', data)
      const filteredProdcuts: any[] = this.productsService.getProductsByCategoryId([...data]);
      this.mapService.addSource(filteredProdcuts)
    })

    this.filterService.filterValues$.subscribe((data) => console.log('filterValues', data))
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
