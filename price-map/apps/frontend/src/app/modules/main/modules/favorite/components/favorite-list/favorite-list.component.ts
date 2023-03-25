import { Component, OnInit } from '@angular/core';
import { Product, User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService, SettingsService, TokenService, WebSocketService } from '../../../../../../services';

@UntilDestroy()
@Component({
  selector: 'favorite-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss'],
})
export class FavoriteListComponent implements OnInit {
  public favoriteProducts: Product[] = [];

  constructor(private readonly settingsService: SettingsService,
    private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(UserEvents.GetFavoriteProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<Product[]>>(UserEvents.GetFavoriteProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product[]>) => this.favoriteProducts = response.data);

    this.webSocketService.on<IResponseData<null>>(UserEvents.UpdateFavoriteProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<User>>(UserEvents.UpdateFavoriteProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User>) => {   
        this.settingsService.setUser(response.data);
        this.favoriteProducts = this.settingsService.getUser().products;
      });

    this.webSocketService.emit<string>(UserEvents.GetFavoriteProductsAttempt, this.tokenService.getPayload().userId);
  }

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
