import { ChangeDetectionStrategy, Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ShopCardComponent } from '..';
import { ThreeJsService } from '../../services';

/**
 * Компонент модального окна с информацией о точке, в которой находится магазин
 * @export
 * @class ShopInfoModalComponent
 * @implements {AfterViewInit}
 */
@Component({
  selector: 'map-shop-info-modal',
  templateUrl: './shop-info-modal.component.html',
  styleUrls: ['./shop-info-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopInfoModalComponent implements AfterViewInit {
  /**
   * Кол-во этажей
   * @type {number}
   * @memberof ShopInfoModalComponent
   */
  public levels: number = 0;

  /**
   * Ссылка на канвас
   * @type {ElementRef<HTMLCanvasElement>}
   * @memberof ShopInfoModalComponent
   */
  @ViewChild('canvas') public canvasRef: ElementRef<HTMLCanvasElement>;

  constructor(public dialogRef: NbDialogRef<ShopCardComponent>,
    private readonly threeJsService: ThreeJsService) {}

  public ngAfterViewInit(): void {
    this.threeJsService.initCanvas(this.canvasRef);
    this.threeJsService.renderBuilding(this.levels);
  }

  /** 
   * Закрытие модального окна
   * @memberof ShopInfoModalComponent
   */
  public close(): void {
    this.dialogRef.close();
  }
}
