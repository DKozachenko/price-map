import { UntilDestroy } from '@ngneat/until-destroy';
import { MapService } from './../../services';
import { Component} from '@angular/core';
import { WebSocketService } from '../../../../services';

@UntilDestroy()
@Component({
  selector: 'map-layers-control',
  templateUrl: './layers-control.component.html',
  styleUrls: ['./layers-control.component.scss']
})
export class LayersControlComponent {
  public mapService: MapService; 
  public webSocketService: WebSocketService; 

  public changeLayer(layerName: string): void {
    console.log(layerName)
  }
}
