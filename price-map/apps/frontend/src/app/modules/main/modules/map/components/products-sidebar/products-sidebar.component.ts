import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { NotificationService, SettingsService, WebSocketService } from '../../../../../../services';
import { Product, User } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { ProductEvents, UserEvents } from '@core/enums';
import { ProductService } from '../../../../services';


@UntilDestroy()
@Component({
  selector: 'map-products-sidebar',
  templateUrl: './products-sidebar.component.html',
  styleUrls: ['./products-sidebar.component.scss'],
})
export class ProductsSidebarComponent implements OnInit {
  public products: Product[] = [];

  constructor(private readonly productsService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly settingService: SettingsService) {}

  public ngOnInit(): void {
    this.productsService.setFavoriteProductIds(new Set(this.settingService.getUser().products.map((product: Product) => product.id)));

    this.webSocketService.on<IResponseData<null>>(ProductEvents.GetProductsByIdsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Product[]>>(ProductEvents.GetProductsByIdsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product[]>) => this.products = response.data);

    this.webSocketService.on<IResponseData<null>>(UserEvents.UpdateFavoriteProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<User>>(UserEvents.UpdateFavoriteProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User>) => {
        // Если в ответе больше избранных, соответственно произошло добавление
        // если меньше, соответственно произошло удаление
        const currentUser: User = this.settingService.getUser();
        if (response.data.products.length > currentUser.products.length) {
          for (const product of response.data.products) {
            if (!currentUser.products.map((product: Product) => product.id).includes(product.id)) {
              this.productsService.emitAdditionProductAction({ id: product.id ?? '', name: 'favorite', direction: 'add' });
              break;
            }
          }
        } else {
          for (const product of currentUser.products) {
            if (!response.data.products.map((product: Product) => product.id).includes(product.id)) {
              this.productsService.emitAdditionProductAction({ id: product.id ?? '', name: 'favorite', direction: 'remove' });
              break;
            }
          }
        }

        this.settingService.setUser(response.data);
      });

    this.productsService.itemIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.webSocketService.emit<string[]>(ProductEvents.GetProductsByIdsAttempt, data));
  }

  public close(): void {
    this.productsService.emitSettingItemIdToShow([]);
  }

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
