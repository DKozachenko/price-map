import { Component, OnInit } from '@angular/core';
import { Product, User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService, SettingsService, WebSocketService } from '../../../../services';

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
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    const currentUser: User = this.settingsService.getUser();
    this.favoriteProducts = currentUser.products;

    this.webSocketService.on<IResponseData<null>>(UserEvents.UpdateFavoriteProductsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<User>>(UserEvents.UpdateFavoriteProductsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User>) => {   
        this.settingsService.setUser(response.data);
        const currentUser: User = this.settingsService.getUser();
        this.favoriteProducts = currentUser.products;
      });
  }

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
