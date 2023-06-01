import { FilterService } from './../../services';
import { ChangeDetectorRef, Component} from '@angular/core';

/**
 * Контрол только избранных товаров
 * @export
 * @class OnlyFavoriteControlComponent
 */
@Component({
  selector: 'map-only-favorite-control',
  templateUrl: './only-favorite-control.component.html',
  styleUrls: ['./only-favorite-control.component.scss']
})
export class OnlyFavoriteControlComponent {
  /**
   * Состояние контрола избранных товаров (включен / выключен)
   * @type {boolean}
   * @memberof OnlyFavoriteControlComponent
   */
  public state: boolean = false;

  /**
   * Сервис фильтров
   * @type {FilterService}
   * @memberof OnlyFavoriteControlComponent
   */
  public filterService: FilterService;

  /**
   * Детектор изменений
   * @type {ChangeDetectorRef}
   * @memberof OnlyFavoriteControlComponent
   */
  public cdr: ChangeDetectorRef;

  /**
   * Смена состояния контрола только избранных товаров (включено / выключено)
   * @memberof OnlyFavoriteControlComponent
   */
  public toggleOnlyFavoriteControl(): void {
    this.state = !this.state;
    this.filterService.emitIsOnlyFavoriteQuery(this.state);
    this.cdr.detectChanges();
  }
}
