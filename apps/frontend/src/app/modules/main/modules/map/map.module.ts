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
  ProductInfoModalComponent,
  ShopsSidebarComponent,
  ShopCardComponent,
  RadiusControlComponent,
  ShopInfoModalComponent,
  OnlyFavoriteControlComponent,
  RouteDownloadNotificationComponent } from './components';
import { MapRoutingModule } from './map-routing.module';
import { FilterService, MapService, PdfService, ShopService, ThreeJsService, RouteService } from './services';
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
  NbDialogModule } from '@nebular/theme';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

/**
 * Модуль карты
 * @export
 * @class MapModule
 */
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
    ProductInfoModalComponent,
    ShopsSidebarComponent,
    ShopCardComponent,
    RadiusControlComponent,
    ShopInfoModalComponent,
    OnlyFavoriteControlComponent,
    RouteDownloadNotificationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
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
    ShopService,
    ThreeJsService,
    PdfService,
    RouteService
  ]
})
export class MapModule { }
