import { UntilDestroy } from '@ngneat/until-destroy';
import { MapService } from './../../services';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { LayerType } from '../../models/types';

@UntilDestroy()
@Component({
  selector: 'map-layers-control',
  templateUrl: './layers-control.component.html',
  styleUrls: ['./layers-control.component.scss']
})
export class LayersControlComponent implements OnInit {
  public layer: LayerType = 'products';
  public mapService: MapService;
  public cdr: ChangeDetectorRef;

  public ngOnInit(): void {
    this.layer = 'products';
  }

  public changeLayer(layerName: LayerType): void {
    this.layer = layerName;
    this.cdr.detectChanges();
    this.mapService.emitSettingCurrentLayer(this.layer);
  }
}
