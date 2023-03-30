import { UntilDestroy } from '@ngneat/until-destroy';
import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ShopCardComponent } from '..';
import * as THREE from 'three';

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

  public rotationSpeedX: number = 0.05;
  public rotationSpeedY: number = 0.05;
  public size: number = 200;

  public cameraZ: number = 400;
  public fieldOfView: number = 1;
  public nearClippingPlane: number = 1;
  public farClippingPlane: number = 1000;

  private camera!: THREE.PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private geometry = new THREE.BoxGeometry(3, 3, 5);
  private material = new THREE.MeshBasicMaterial({ color: '#FF0000' });

  private cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.add(this.cube);
    let aspectRadio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRadio,
      this.nearClippingPlane,
       this.farClippingPlane
    )

    this.camera.position.z = this.cameraZ;
  }

  private getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  constructor(public dialogRef: NbDialogRef<ShopCardComponent>) {}

  public ngOnInit(): void {

  }

  public ngAfterViewInit(): void {
    this.createScene();
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: ShopInfoModalComponent = this;

    (function render() {
      requestAnimationFrame(render);
      component.renderer.render(component.scene, component.camera);
    })();
  }

  public close(): void {
    this.dialogRef.close();
  }


}
