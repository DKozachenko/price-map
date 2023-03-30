import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { NotificationService, WebSocketService } from '../../../../../../services';
import { ShopService } from '../../services';
import { Shop } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { ShopEvents } from '@core/enums';
import { ShopInfoModalComponent } from '../shop-info-modal/shop-info-modal.component';
import { NbDialogService } from '@nebular/theme';


@UntilDestroy()
@Component({
  selector: 'map-shops-sidebar',
  templateUrl: './shops-sidebar.component.html',
  styleUrls: ['./shops-sidebar.component.scss'],
})
export class ShopsSidebarComponent implements OnInit {
  public shops: Shop[] = [];

  constructor(private readonly shopsService: ShopService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService, 
    private readonly dialogService: NbDialogService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>('')
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<number>>('')
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<number>) => this.openBuildfingInfo(response.data));

    this.webSocketService.on<IResponseData<null>>(ShopEvents.GetShopsByIdsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Shop[]>>(ShopEvents.GetShopsByIdsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Shop[]>) => this.shops = response.data);

    this.shopsService.itemIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.webSocketService.emit<string[]>(ShopEvents.GetShopsByIdsAttempt, data));
  }

  public close(): void {
    this.shopsService.emitSettingItemIdToShow([]);
  }

  public openBuildfingInfo(levels: number): void  {
    this.dialogService.open<ShopInfoModalComponent>(ShopInfoModalComponent, {
      context: {
        levels
      },
    });
  }

  public trackByShop(index: number, item: Shop): string {
    return item.id ?? index;
  }
}
