import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Product } from '@core/entities';
import { NotificationService, WebSocketService } from '../../../../services';
import { ProductService } from '../../services';
import { ICoordinates, IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { IResponseCallback } from '../../../../models/interfaces';

@UntilDestroy()
@Component({
  selector: 'price-map-product-popup',
  templateUrl: './product-popup.component.html',
  styleUrls: ['./product-popup.component.scss']
})
export class ProductPopupComponent {
  public productInfo: any = {
    id: '',
    name: '',
    description: ''
  };

  public productService: ProductService; 

  public addProductIdToRoute(): void {
    this.productService.addProductIdToRoute(this.productInfo.id);
  }
}
