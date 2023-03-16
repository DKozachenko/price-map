import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacteristicFilterComponent, 
  CheckboxComponent, 
  FilterComponent, 
  MapComponent, 
  RouteReviewComponent, 
  ProductMiniCardComponent,
  ClearControlComponent,
  LayersControlComponent,
  PriceControlComponent,
  ProductsSidebarComponent,
  ProductCardComponent
} from './components';
import { MapRoutingModule } from './map-routing.module';
import { FilterService, MapService, ProductService } from './services';
import { NbCardModule, 
  NbCheckboxModule, 
  NbIconModule, 
  NbInputModule, 
  NbLayoutModule, 
  NbRadioModule, 
  NbSelectModule, 
  NbButtonModule, 
  NbListModule,
  NbBadgeModule, 
  NbSpinnerModule,
  NbActionsModule,
  NbTooltipModule} from '@nebular/theme';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    MapComponent,
    FilterComponent,
    CharacteristicFilterComponent,
    RouteReviewComponent,
    CheckboxComponent,
    ProductMiniCardComponent,
    ClearControlComponent,
    LayersControlComponent,
    PriceControlComponent,
    ProductsSidebarComponent,
    ProductCardComponent
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
    NbListModule,
    NbBadgeModule,
    NbSpinnerModule,
    NbActionsModule,
    NbTooltipModule,
    SharedModule
  ],
  providers: [
    MapService,
    FilterService,
    ProductService,
  ]
})
export class MapModule { }
