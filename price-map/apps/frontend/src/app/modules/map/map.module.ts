import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components';
import { MapRoutingModule } from './map-routing.module';
import { MapService } from './services';

@NgModule({
  declarations: [MapComponent],
  imports: [
    CommonModule,
    MapRoutingModule
  ],
  providers: [MapService]
})
export class MapModule { }
