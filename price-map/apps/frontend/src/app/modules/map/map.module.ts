import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacteristicFilterComponent, FilterComponent, MapComponent, RouteReviewComponent } from './components';
import { MapRoutingModule } from './map-routing.module';
import { FilterService, MapService, ProductsService } from './services';

@NgModule({
  declarations: [
    MapComponent,
    FilterComponent,
    CharacteristicFilterComponent,
    RouteReviewComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule
  ],
  providers: [
    MapService,
    FilterService,
    ProductsService
  ]
})
export class MapModule { }
