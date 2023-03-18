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
  ProductCardComponent,
  ProductInfoModalComponent
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
  NbTooltipModule,
  NbDialogService,
  NbDialogModule} from '@nebular/theme';
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
    ProductCardComponent,
    ProductInfoModalComponent
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
    NbDialogModule.forChild({
      closeOnBackdropClick: false,
      hasBackdrop: true,
      hasScroll: true
    }),
    SharedModule
  ],
  providers: [
    NbDialogService,
    MapService,
    FilterService,
    ProductService,
  ]
})
export class MapModule { }
