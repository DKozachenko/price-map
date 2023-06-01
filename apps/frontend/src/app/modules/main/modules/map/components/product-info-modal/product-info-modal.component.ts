import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Product } from '@core/entities';
import { NbDialogRef } from '@nebular/theme';
import { ProductCardComponent } from '..';
import { ICharacteristic } from '@core/interfaces';

/**
 * Компонент модального окна с подробной информацией о товаре
 * @export
 * @class ProductInfoModalComponent
 */
@Component({
  selector: 'map-product-info-modal',
  templateUrl: './product-info-modal.component.html',
  styleUrls: ['./product-info-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductInfoModalComponent {
  /** 
   * Товар
   * @type {(Product | null)}
   * @memberof ProductInfoModalComponent
   */
  public product: Product | null;

  constructor(public dialogRef: NbDialogRef<ProductCardComponent>) {}

  /**
   * Закрытие модального окна
   * @memberof ProductInfoModalComponent
   */
  public close(): void {
    this.dialogRef.close();
  }

  /**
   * Функция trackBy для характеристик
   * @param {number} index индекс
   * @param {ICharacteristic} item значение
   * @return {*}  {string} название характеристики
   * @memberof ProductInfoModalComponent
   */
  public trackByCharacteristic(index: number, item: ICharacteristic): string {
    return item.name ?? index;
  }
}
