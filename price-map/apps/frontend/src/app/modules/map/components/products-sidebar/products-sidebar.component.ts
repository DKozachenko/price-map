import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { NotificationService, ProductService, SettingsService, WebSocketService } from '../../../../services';
import { Product, User } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { ProductEvents, UserEvents } from '@core/enums';


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
    this.productsService.favoriteProductIds = new Set(this.settingService.currentUser.products.map((product: Product) => product.id));

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
        if (response.data.products.length > this.settingService.currentUser.products.length) {
          for (const product of response.data.products) {
            if (!this.settingService.currentUser.products.map((product: Product) => product.id).includes(product.id)) {
              this.productsService.productAction$.next({ id: product.id ?? '', name: 'favorite', direction: 'add' });
              break;
            }
          }
        } else {
          for (const product of this.settingService.currentUser.products) {
            if (!response.data.products.map((product: Product) => product.id).includes(product.id)) {
              this.productsService.productAction$.next({ id: product.id ?? '', name: 'favorite', direction: 'remove' });
              break;
            }
          }
        }
        
        this.settingService.currentUser = response.data;
      });

    this.productsService.itemIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.webSocketService.emit<string[]>(ProductEvents.GetProductsByIdsAttempt, data));
  }

  public close(): void {
    this.productsService.itemIdsToShow$.next([]);
  }

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
