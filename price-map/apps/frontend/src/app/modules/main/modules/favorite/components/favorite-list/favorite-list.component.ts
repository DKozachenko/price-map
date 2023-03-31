import { Component, OnInit } from '@angular/core';
import { Product, User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService, SettingsService, TokenService, WebSocketService } from '../../../../../../services';
import { ProductService } from '../../../../services';

/**
 * Компонент списка избранных товаров
 * @export
 * @class FavoriteListComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'favorite-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss'],
})
export class FavoriteListComponent implements OnInit {
  /**
   * Избранные товары
   * @type {Product[]}
   * @memberof FavoriteListComponent
   */
  public favoriteProducts: Product[] = [];

  /**
   * Происходит ли загрузка
   * @type {boolean}
   * @memberof FavoriteListComponent
   */
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
        this.productsService.setFavoriteProductIds(new Set(
          this.settingsService.getUser().products.map((product: Product) => product.id)
        ));
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

  /**
   * Установка загрузки
   * @param {boolean} state состояние
   * @memberof FavoriteListComponent
   */
  public setLoading(state: boolean): void {
    this.isLoading = state;
  }

  /**
   * Функция trackBy для избранных товаров
   * @param {number} index индекс
   * @param {Product} item значение
   * @return {*}  {string} id товара
   * @memberof FavoriteListComponent
   */
  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
