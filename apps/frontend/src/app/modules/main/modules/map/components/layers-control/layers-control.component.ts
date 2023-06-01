import { MapService } from './../../services';
import { Component, OnInit, ChangeDetectorRef, } from '@angular/core';
import { LayerType } from '../../models/types';

/**
 * Компонент для контрола слоев
 * @export
 * @class LayersControlComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'map-layers-control',
  templateUrl: './layers-control.component.html',
  styleUrls: ['./layers-control.component.scss']
})
export class LayersControlComponent implements OnInit {
  /**
   * Текущий слой
   * @type {LayerType}
   * @memberof LayersControlComponent
   */
  public layer: LayerType = 'products';

  /**
   * Сервис по работе с картой
   * @type {MapService}
   * @memberof LayersControlComponent
   */
  public mapService: MapService;

  /**
   * Детектор изменений
   * @type {ChangeDetectorRef}
   * @memberof LayersControlComponent
   */
  public cdr: ChangeDetectorRef;

  public ngOnInit(): void {
    this.layer = 'products';
  }

  /**
   * Смена слоя
   * @param {LayerType} layerName название слоя
   * @memberof LayersControlComponent
   */
  public changeLayer(layerName: LayerType): void {
    this.layer = layerName;
    this.cdr.detectChanges();
    this.mapService.emitSettingCurrentLayer(this.layer);
  }
}
