import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { NotificationService, WebSocketService } from '../../../../../../services';
import { ShopService } from '../../services';
import { Shop } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { ShopEvents } from '@core/enums';
import { NbDialogService } from '@nebular/theme';
import { ShopInfoModalComponent } from '../shop-info-modal/shop-info-modal.component';

/**
 * Компонент боковой панели с магазинами
 * @export
 * @class ShopsSidebarComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'map-shops-sidebar',
  templateUrl: './shops-sidebar.component.html',
  styleUrls: ['./shops-sidebar.component.scss'],
})
export class ShopsSidebarComponent implements OnInit {
  /**
   * Магазины
   * @type {Shop[]}
   * @memberof ShopsSidebarComponent
   */
  public shops: Shop[] = [];

  constructor(private readonly shopsService: ShopService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService, 
    private readonly dialogService: NbDialogService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(ShopEvents.GetBuildgingInfoFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<number>>(ShopEvents.GetBuildgingInfoSuccessed)
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

  /** 
   * Открытие модального окна с информацией о здании
   * @param {number} levels кол-во этажей
   * @memberof ShopsSidebarComponent
   */
  public openBuildfingInfo(levels: number): void  {
    this.dialogService.open<ShopInfoModalComponent>(ShopInfoModalComponent, {
      context: {
        levels
      },
    });
  }

  /**
   * Закрытие боковой панели
   * @memberof ShopsSidebarComponent
   */
  public close(): void {
    this.shopsService.emitSettingItemIdToShow([]);
  }

  /**
   * Функция trackBy для магазинов
   * @param {number} index индекс
   * @param {Shop} item значение
   * @return {*}  {string} id магазина
   * @memberof ShopsSidebarComponent
   */
  public trackByShop(index: number, item: Shop): string {
    return item.id ?? index;
  }
}
