import { MapService } from './../../services';
import { ChangeDetectorRef, Component} from '@angular/core';

@Component({
  selector: 'map-radius-control',
  templateUrl: './radius-control.component.html',
  styleUrls: ['./radius-control.component.scss']
})
export class RadiusControlComponent {
  public state: boolean = false;
  public mapService: MapService;
  public cdr: ChangeDetectorRef;

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
