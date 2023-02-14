import { MapService } from './../../services';
import { Component} from '@angular/core';

@Component({
  selector: 'map-clear-control',
  templateUrl: './clear-control.component.html',
  styleUrls: ['./clear-control.component.scss']
})
export class ClearControlComponent {
  public mapService: MapService; 

  public removeLine(): void {
    this.mapService.removeRouteLayer();
  }
}
