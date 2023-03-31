import { MapService } from './../../services';
import { ChangeDetectorRef, Component} from '@angular/core';

/**
 * Компонент для контрола радиуса
 * @export
 * @class RadiusControlComponent
 */
@Component({
  selector: 'map-radius-control',
  templateUrl: './radius-control.component.html',
  styleUrls: ['./radius-control.component.scss']
})
export class RadiusControlComponent {
  /**
   * Состояние контрола рисования (включен / выключен)
   * @type {boolean}
   * @memberof RadiusControlComponent
   */
  public state: boolean = false;

  /**
   * Сервис по работе с картой
   * @type {MapService}
   * @memberof RadiusControlComponent
   */
  public mapService: MapService;

  /**
   * Детектор изменений
   * @type {ChangeDetectorRef}
   * @memberof RadiusControlComponent
   */
  public cdr: ChangeDetectorRef;

  /**
   * Смена состояния контрола рисования (включено / выключено)
   * @memberof RadiusControlComponent
   */
  public toggleDrawControl(): void {
    if (this.state) {
      this.mapService.removeDrawControl();
    } else {
      this.mapService.addDrawControl();
    }
    this.state = !this.state;
    this.cdr.detectChanges();
  }
}
