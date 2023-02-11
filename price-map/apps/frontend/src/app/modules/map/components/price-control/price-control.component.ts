import { FilterService } from './../../services';
import { Component} from '@angular/core';

@Component({
  selector: 'map-price-control',
  templateUrl: './price-control.component.html',
  styleUrls: ['./price-control.component.scss']
})
export class PriceControlComponent {
  public filterService: FilterService; 

  
}
