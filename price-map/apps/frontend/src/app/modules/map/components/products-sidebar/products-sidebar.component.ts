import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { NotificationService, WebSocketService } from '../../../../services';
import { ProductService } from '../../services';
import { Product } from '@core/entities';
import { IResponseData } from '@core/interfaces';
import { ProductEvents } from '@core/enums';


@UntilDestroy()
@Component({
  selector: 'price-map-products-sidebar',
  templateUrl: './products-sidebar.component.html',
  styleUrls: ['./products-sidebar.component.scss'],
})
export class ProductsSidebarComponent implements OnInit {
  public products: Product[] = []

  constructor(private readonly productsService: ProductService,
    private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketSevice.on<IResponseData<null>>(ProductEvents.GetProductsByIdsFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketSevice.on<IResponseData<Product[]>>(ProductEvents.GetProductsByIdsSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Product[]>) => {
        this.products = response.data;
        console.log(this.products)
      });

    this.productsService.productIdsToShow$
      .pipe(untilDestroyed(this))
      .subscribe((data: string[]) => this.webSocketSevice.emit<string[]>(ProductEvents.GetProductsByIdsAttempt, data));
  }

  public close(): void {
    this.productsService.productIdsToShow$.next([]);
  }

  public trackByProduct(index: number, item: Product): string {
    return item.id ?? index;
  }
}
