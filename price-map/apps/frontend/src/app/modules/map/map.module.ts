import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacteristicFilterComponent, CheckboxComponent, FilterComponent, MapComponent, RouteReviewComponent, ProductMiniCardComponent } from './components';
import { MapRoutingModule } from './map-routing.module';
import { FilterService, MapService, OsrmService, ProductsService } from './services';
import { NbCardModule, NbCheckboxModule, NbIconModule, NbInputModule, NbLayoutModule, NbRadioModule, NbSelectModule, NbButtonModule } from '@nebular/theme';
import { SharedModule } from '..';

@NgModule({
  declarations: [
    MapComponent,
    FilterComponent,
    CharacteristicFilterComponent,
    RouteReviewComponent,
    CheckboxComponent,
    ProductMiniCardComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    NbLayoutModule,
    NbIconModule,
    NbCardModule,
    NbCheckboxModule,
    NbRadioModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
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
