import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService, ProductsService } from '../../services';

@Component({
  selector: 'price-map-route-review',
  templateUrl: './route-review.component.html',
  styleUrls: ['./route-review.component.scss'],
})
export class RouteReviewComponent implements OnChanges {
  @Input()
  public productIds: string[] = [];

  public products: any = [];

  constructor(private readonly productsService: ProductsService) {}


  public ngOnChanges(changes: SimpleChanges): void {
    this.products = this.productsService.getProductsByIds(this.productIds);
  }

  public buildRoute(): void {
    console.log(this.products)
  }
}
