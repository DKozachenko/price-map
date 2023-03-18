import { UntilDestroy } from '@ngneat/until-destroy';
import { Component, Input, OnInit } from '@angular/core';
import { Shop } from '@core/entities';

@UntilDestroy()
@Component({
  selector: 'map-shop-card',
  templateUrl: './shop-card.component.html',
  styleUrls: ['./shop-card.component.scss']
})
export class ShopCardComponent implements OnInit {
  @Input() public shop: Shop | null = null;
  constructor () {}

  public ngOnInit(): void {

  }
}
