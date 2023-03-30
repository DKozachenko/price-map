import { UntilDestroy } from '@ngneat/until-destroy';
import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ShopCardComponent } from '..';
import { ThreeJsService } from '../../services';


@UntilDestroy()
@Component({
  selector: 'map-shop-info-modal',
  templateUrl: './shop-info-modal.component.html',
  styleUrls: ['./shop-info-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopInfoModalComponent implements OnInit, AfterViewInit {
  public levels: number = 0;

  @ViewChild('canvas') public canvasRef: ElementRef<HTMLCanvasElement>;

  constructor(public dialogRef: NbDialogRef<ShopCardComponent>,
    private readonly threeJsService: ThreeJsService) {}

  public ngOnInit(): void {
    // console.log(this.levels)
  }

  public ngAfterViewInit(): void {
    this.threeJsService.initCanvas(this.canvasRef);
    this.threeJsService.renderBuilding(this.levels);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
