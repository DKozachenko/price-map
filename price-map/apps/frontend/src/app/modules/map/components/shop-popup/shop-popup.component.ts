import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { IShopInfo } from '../../models/interfaces';

@Component({
  selector: 'map-product-popup',
  templateUrl: './shop-popup.component.html',
  styleUrls: ['./shop-popup.component.scss']
})
export class ShopPopupComponent {
  public shopInfo: IShopInfo;
}
