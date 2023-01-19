import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService, OsrmService, ProductsService } from '../../services';

@Component({
  selector: 'price-map-route-review',
  templateUrl: './route-review.component.html',
  styleUrls: ['./route-review.component.scss'],
})
export class RouteReviewComponent implements OnChanges {
  @Input()
  public productIds: string[] = [];

  public products: any = [];

  constructor(private readonly productsService: ProductsService,
    private readonly osrmService: OsrmService,
    private readonly mapService: MapService) {}


  public ngOnChanges(changes: SimpleChanges): void {
    this.products = this.productsService.getProductsByIds(this.productIds);
  }

  public getCoordinates(): { lat: number, lon: number }[] {
    return this.products.map((product: any) => {
      return {
        lat: product.shop.coordinates.latitude,
        lon: product.shop.coordinates.longitude
      };
    });
  }

  public buildRoute(): void {
    const coordinates = this.getCoordinates();

    this.osrmService.buildRoute(coordinates)
      .subscribe((data) => {
        const coordinates: number[][] = data.routes[0].geometry.coordinates;
        this.mapService.addLineSource(coordinates);
      });
  }
}
