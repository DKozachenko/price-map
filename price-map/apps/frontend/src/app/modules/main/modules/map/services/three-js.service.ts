import { ElementRef, Injectable } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Сервис для создания 3D графики, использующий ThreeJs
 * @export
 * @class ThreeJsService
 */
@Injectable()
export class ThreeJsService {
  /**
   * Элемент канваса
   * @private
   * @type {HTMLCanvasElement}
   * @memberof ThreeJsService
   */
  private canvas: HTMLCanvasElement;

  /**
   * Камера
   * @private
   * @type {THREE.PerspectiveCamera}
   * @memberof ThreeJsService
   */
  private camera: THREE.PerspectiveCamera;

  /**
   * Сцена
   * @private
   * @type {THREE.Scene}
   * @memberof ThreeJsService
   */
  private scene: THREE.Scene;

  /**
   * Рендерер
   * @private
   * @type {THREE.WebGLRenderer}
   * @memberof ThreeJsService
   */
  private renderer: THREE.WebGLRenderer;

  /**
   * Высота этажа
   * @private
   * @type {number}
   * @memberof ThreeJsService
   */
  private floorHeight: number = 2.5;

  /**
   * Ширина этажа
   * @private
   * @type {number}
   * @memberof ThreeJsService
   */
  private floorWidth: number = 5;

  /**
   * Глубина этажа
   * @private
   * @type {number}
   * @memberof ThreeJsService
   */
  private floorDepth: number = 7;

  /**
   * Смещение по высоте для центрирования
   * @private
   * @type {number}
   * @memberof ThreeJsService
   */
  private yOffset: number = 0;

  /**
   * Приближение камеры
   * @private
   * @type {number}
   * @memberof ThreeJsService
   */
  private fov: number = 1;

  /**
   * Создание сцены
   * @private
   * @memberof ThreeJsService
   */
  private createScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#323259');
  }

  /**
   * Получение соотношения сторон
   * @private
   * @return {*}  {number}
   * @memberof ThreeJsService
   */
  private getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  /**
   * Создание камеры
   * @private
   * @param {number} levels кол-во этажей
   * @memberof ThreeJsService
   */
  private createCamera(levels: number): void {
    const aspectRadio: number = this.getAspectRatio();
    this.fov = levels / 2;
    this.camera = new THREE.PerspectiveCamera(this.fov, aspectRadio, 2, 1000);
    this.camera.position.x = 50;
    this.camera.position.y = 50;
    this.camera.position.z = 400;
  }

  /**
   * Создание рендерера
   * @private
   * @memberof ThreeJsService
   */
  private createRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  /**
   * Рендер элементов
   * @private
   * @memberof ThreeJsService
   */
  private render(): void {
    //eslint-disable-next-line @typescript-eslint/no-this-alias
    const service: ThreeJsService = this;

    (function render() {
      requestAnimationFrame(render);
      service.renderer.render(service.scene, service.camera);
    })();
  }

  /**
   * Добавление этажа
   * @private
   * @param {number} currentNumber текущий номер
   * @memberof ThreeJsService
   */
  private addFloor(currentNumber: number): void {
    const box: THREE.BoxGeometry = new THREE.BoxGeometry( this.floorWidth, this.floorHeight, this.floorDepth );
    // https://stackoverflow.com/questions/20153705/three-js-wireframe-material-all-polygons-vs-just-edges
    // По заветам со stackOverflow использование именно EdgesGeometry
    const geometry: THREE.EdgesGeometry = new THREE.EdgesGeometry(box);
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial( { color: 'white'} );

    const wireframe: THREE.LineSegments = new THREE.LineSegments(geometry, material);
    wireframe.position.set(0, -this.yOffset + this.floorHeight * currentNumber, 0);
    this.scene.add(wireframe);
  }

  /**
   * Добавление этажей
   * @private
   * @param {number} levels кол-во этажей
   * @memberof ThreeJsService
   */
  private addFloors(levels: number): void {
    for (let i = 0; i < levels; ++i) {
      this.addFloor(i);
    }
  }

  /**
   * Добавление контрола для вращения мышкой
   * @private
   * @memberof ThreeJsService
   */
  private addControls(): void {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.update();
  }

  /**
   * Рендер этажей
   * @param {number} levels кол-во этажей
   * @memberof ThreeJsService
   */
  public renderBuilding(levels: number): void {
    this.yOffset = ((levels - 1) * this.floorHeight) / 2;    
    this.createScene();
    this.addFloors(levels);
    this.createCamera(levels);
    this.createRenderer();
    this.addControls();
    this.render();
  }
  
  /**
   * Инициализация канваса
   * @param {ElementRef<HTMLCanvasElement>} canvasRef ссылка на элемент канваса
   * @memberof ThreeJsService
   */
  public initCanvas(canvasRef: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvasRef.nativeElement;
  }
}