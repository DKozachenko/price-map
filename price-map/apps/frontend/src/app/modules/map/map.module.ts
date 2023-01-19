import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacteristicFilterComponent, FilterComponent, MapComponent, RouteReviewComponent } from './components';
import { MapRoutingModule } from './map-routing.module';
import { FilterService, MapService, OsrmService, ProductsService } from './services';
import { NbIconModule, NbLayoutModule } from '@nebular/theme';
import { SharedModule } from '..';

@NgModule({
  declarations: [
    MapComponent,
    FilterComponent,
    CharacteristicFilterComponent,
    RouteReviewComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    NbLayoutModule,
    NbIconModule,
    SharedModule
  ],
  providers: [
    MapService,
    FilterService,
    ProductsService,
    OsrmService
  ]
})
export class MapModule { }
