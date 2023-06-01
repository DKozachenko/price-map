import { MapService } from './../../services';
import { Component} from '@angular/core';

/**
 * Компонент для контрола очистки маршрута
 * @export
 * @class ClearControlComponent
 */
@Component({
  selector: 'map-clear-control',
  templateUrl: './clear-control.component.html',
  styleUrls: ['./clear-control.component.scss']
})
export class ClearControlComponent {
  /**
   * Сервис для работы с картой
   * @type {MapService}
   * @memberof ClearControlComponent
   */
  public mapService: MapService; 

  /**
   * Удаление лишини маршрута
   * @memberof ClearControlComponent
   */
  public removeLine(): void {
    this.mapService.removeRouteLayer();
  }
}
