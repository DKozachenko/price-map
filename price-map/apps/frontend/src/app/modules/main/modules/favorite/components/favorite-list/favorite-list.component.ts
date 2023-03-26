import { Component, OnInit } from '@angular/core';
import { Product, User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService, SettingsService, TokenService, WebSocketService } from '../../../../../../services';
import { ProductService } from '../../../../services';

@UntilDestroy()
@Component({
  selector: 'favorite-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss'],
})
export class FavoriteListComponent implements OnInit {
  public favoriteProducts: Product[] = [];
  public isLoading: boolean = false;

  constructor(private readonly settingsService: SettingsService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly tokenService: TokenService,
    private readonly productsService: ProductService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(UserEvents.GetFavoriteProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<Product[]>>(UserEvents.GetFavoriteProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product[]>) => {
        this.productsService.setFavoriteProductIds(new Set(this.settingsService.getUser().products.map((product: Product) => product.id)));
        this.favoriteProducts = response.data;
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<null>>(UserEvents.UpdateFavoriteProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<User>>(UserEvents.UpdateFavoriteProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User>) => {
        this.settingsService.setUser(response.data);
        this.favoriteProducts = this.settingsService.getUser().products;
        this.isLoading = false;
      });

    this.isLoading = true;
    this.webSocketService.emit<string>(UserEvents.GetFavoriteProductsAttempt, this.tokenService.getPayload().userId);
  }

  public setLoading(state: boolean): void {
    this.isLoading = state;
  }

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
