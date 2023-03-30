import { UntilDestroy } from '@ngneat/until-destroy';
import { Component, Input, OnInit } from '@angular/core';
import { Shop } from '@core/entities';
import { NbDialogService } from '@nebular/theme';
import { ShopInfoModalComponent } from '..';

@UntilDestroy()
@Component({
  selector: 'map-shop-card',
  templateUrl: './shop-card.component.html',
  styleUrls: ['./shop-card.component.scss']
})
export class ShopCardComponent implements OnInit {
  @Input() public shop: Shop | null = null;
  constructor (private readonly dialogService: NbDialogService) {}

  public ngOnInit(): void {

  }

  public openFloorInfo(): void  {
    this.dialogService.open<ShopInfoModalComponent>(ShopInfoModalComponent, {
      context: {
        levels: 4
      },
    });
  }
}
