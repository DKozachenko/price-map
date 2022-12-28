import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacteristicFilterComponent, FilterComponent, MapComponent } from './components';
import { MapRoutingModule } from './map-routing.module';
import { FilterService, MapService } from './services';

@NgModule({
  declarations: [
    MapComponent,
    FilterComponent,
    CharacteristicFilterComponent
  ],
  imports: [
    CommonModule,
    MapRoutingModule
  ],
  providers: [
    MapService,
    FilterService
  ]
})
export class MapModule { }
