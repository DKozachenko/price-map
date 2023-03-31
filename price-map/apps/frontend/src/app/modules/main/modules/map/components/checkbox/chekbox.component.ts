import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Компонент чекбокса (в отличие от библиотечного может принимать входной параметр checked)
 * @export
 * @class CheckboxComponent
 */
@Component({
  selector: 'map-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  /**
   * Текст
   * @type {string}
   * @memberof CheckboxComponent
   */
  @Input() public text: string = '';
  
  /**
   * Выбран ли чекбокс
   * @type {boolean}
   * @memberof CheckboxComponent
   */
  @Input() public checked: boolean = true;
}
