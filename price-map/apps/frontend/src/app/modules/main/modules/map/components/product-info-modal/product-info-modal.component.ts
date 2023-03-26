import { UntilDestroy } from '@ngneat/until-destroy';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Product } from '@core/entities';
import { NbDialogRef } from '@nebular/theme';
import { ProductCardComponent } from '..';
import { ICharacteristic } from '@core/interfaces';

@UntilDestroy()
@Component({
  selector: 'map-product-info-modal',
  templateUrl: './product-info-modal.component.html',
  styleUrls: ['./product-info-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductInfoModalComponent {
  public product: Product | null;

  constructor(public dialogRef: NbDialogRef<ProductCardComponent>) {}

  public close(): void {
    this.dialogRef.close();
  }

  public trackByCharacteristic(index: number, item: ICharacteristic): string {
    return item.name ?? index;
  }
}
