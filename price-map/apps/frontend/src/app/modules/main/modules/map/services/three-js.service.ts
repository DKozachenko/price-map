import { ElementRef, Injectable } from "@angular/core";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

@Injectable()
export class ThreeJsService {
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  private floorHeight: number = 2.5;
  private floorWidth: number = 5;
  private floorDepth: number = 7;

  private yOffset: number = 0;
  private fov: number = 1;

  public initCanvas(canvasRef: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvasRef.nativeElement;
  }

  public render(): void {
    let service: ThreeJsService = this;

    (function render() {
      requestAnimationFrame(render);
      service.renderer.render(service.scene, service.camera);
    })();
  }

  private addCube(currentNumber: number): void {
    const box: THREE.BoxGeometry = new THREE.BoxGeometry( this.floorWidth, this.floorHeight, this.floorDepth );
    // https://stackoverflow.com/questions/20153705/three-js-wireframe-material-all-polygons-vs-just-edges
    // По заветам со stackOverflow использование именно EdgesGeometry
    const geometry: THREE.EdgesGeometry = new THREE.EdgesGeometry(box);
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial( { color: 'white'} );

    const wireframe: THREE.LineSegments = new THREE.LineSegments(geometry, material);
    wireframe.position.set(0, -this.yOffset + this.floorHeight * currentNumber, 0);
    this.scene.add(wireframe);
  }

  private addCubes(levels: number): void {
    for (let i = 0; i < levels; ++i) {
      this.addCube(i);
    }
  }

  private createCamera(levels: number): void {
    const aspectRadio: number = this.getAspectRatio();
    this.fov = levels / 2;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspectRadio, 2, 1000)
    this.camera.position.x = 50;
    this.camera.position.y = 50;
    this.camera.position.z = 400;   
    console.log(this.camera.getFocalLength())
  }

  private getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }


  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#323259');
  }

  private createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  private addControls(): void {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
  }

  public renderBuilding(levels: number): void {
    this.yOffset = ((levels - 1) * this.floorHeight) / 2;    
    this.createScene();
    this.addCubes(levels);
    this.createCamera(levels);
    this.createRenderer();
    this.addControls();
    this.render();
  }


}