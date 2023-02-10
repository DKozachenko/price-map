import { UntilDestroy } from '@ngneat/until-destroy';
import { MapService } from './../../services';
import { Component} from '@angular/core';
import { WebSocketService } from '../../../../services';
import { LayerType } from '../../models/types';

@UntilDestroy()
@Component({
  selector: 'map-layers-control',
  templateUrl: './layers-control.component.html',
  styleUrls: ['./layers-control.component.scss']
})
export class LayersControlComponent {
  public layer: LayerType = 'products';

  public mapService: MapService; 
  public webSocketService: WebSocketService; 

  public changeLayer(layerName: LayerType): void {
    this.mapService.currentLayer$.next(layerName);
  }
}
