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

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly mapService: MapService,
    private readonly filterService: FilterService,
    private readonly productsService: ProductsService) {}

  public ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
    this.mapService.loadProductImage();

    this.mapService.map.on('load', () => {
      this.mapService.addSource(this.productsService.products)
    })
    this.mapService.addControl();
    this.mapService.setClicks();
  }

  public ngOnInit(): void {
    this.webSocketSevice.socket.on('get users failed', (response) => {
      console.log('on get users failed', response);
      alert('Глаза разуй, дебил, данные чекни');
    });

    this.webSocketSevice.socket.on('get users successed', (response) => {
      console.log('on get users successed', response);
    });

    this.webSocketSevice.addToken();
    this.webSocketSevice.socket.emit('get users attempt', { temp: 1 });

    this.mapService.clicks$.subscribe((data) => console.log('clicks', data))
    this.mapService.productIdsToRoute$.subscribe((data) => console.log('productIdsToRoute', data))

    this.filterService.chechedCategories3Level$.subscribe((data) => console.log('chechedCategories3Level', data))

    this.filterService.filterValues$.subscribe((data) => console.log('filterValues', data))
  }

  public ngOnDestroy() {
    this.mapService.removeMap();
  }
}
