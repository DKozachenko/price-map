import { Component, Input } from '@angular/core';
import { Shop } from '@core/entities';
import { WebSocketService } from './../../../../../../services';
import { ShopEvents } from '@core/enums';

/**
 * Компонент карточки магазина
 * @export
 * @class ShopCardComponent
 */
@Component({
  selector: 'map-shop-card',
  templateUrl: './shop-card.component.html',
  styleUrls: ['./shop-card.component.scss']
})
export class ShopCardComponent {
  /**
   * Магазин
   * @type {(Shop | null)}
   * @memberof ShopCardComponent
   */
  @Input() public shop: Shop | null = null;

  constructor (private readonly webSocketService: WebSocketService) {}

  /**
   * Получение информации о здании
   * @memberof ShopCardComponent
   */
  public getBuildingInfo(): void {
    this.webSocketService.emit<string>(ShopEvents.GetBuildgingInfoAttempt, this.shop?.id ?? '');
  }
}
