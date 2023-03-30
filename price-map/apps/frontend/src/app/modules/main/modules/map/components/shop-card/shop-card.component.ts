import { UntilDestroy } from '@ngneat/until-destroy';
import { Component, Input } from '@angular/core';
import { Shop } from '@core/entities';
import { WebSocketService } from './../../../../../../services';

@UntilDestroy()
@Component({
  selector: 'map-shop-card',
  templateUrl: './shop-card.component.html',
  styleUrls: ['./shop-card.component.scss']
})
export class ShopCardComponent {
  @Input() public shop: Shop | null = null;
  constructor (private readonly webSocketService: WebSocketService) {}


  public getBuildingInfo(): void {
    this.webSocketService.emit<string>('', this.shop?.id ?? '');
  }
}
