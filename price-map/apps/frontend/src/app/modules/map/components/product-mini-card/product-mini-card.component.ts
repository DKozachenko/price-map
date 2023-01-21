import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Product } from '@core/entities';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { WebSocketService } from '../../../../services';
import { FilterService, MapService, OsrmService, ProductsService } from '../../services';

@Component({
  selector: 'map-product-mini-card',
  templateUrl: './product-mini-card.component.html',
  styleUrls: ['./product-mini-card.component.scss'],
})
export class ProductMiniCardComponent {
  @Input()
  public product: any;

  constructor() {}
}
