import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'map-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  @Input() text: string = '';
  @Input() checked: boolean = true;
}
