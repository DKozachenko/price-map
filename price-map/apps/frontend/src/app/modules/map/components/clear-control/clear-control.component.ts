import { MapService } from './../../services';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'map-clear-control',
  templateUrl: './clear-control.component.html',
  styleUrls: ['./clear-control.component.scss']
})
export class ClearControlComponent {
  public mapService: MapService; 

  public removeLine(): void {
    console.log(123);
    this.mapService.removeRouteLayer();
  }
}
