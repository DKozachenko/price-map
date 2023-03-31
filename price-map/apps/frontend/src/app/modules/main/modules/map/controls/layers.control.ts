import { ComponentFactoryResolver, Injector } from '@angular/core';
import { LayersControlComponent } from '../components';
import { MapService } from '../services';
import { IControl } from 'maplibre-gl';
import { IMapControl } from '../models/interfaces';

/**
 * Контрол слоев
 * @export
 * @class LayersControl
 * @implements {IControl}
 */
export class LayersControl implements IControl, IMapControl {
  /**
   * Контейнер
   * @private
   * @type {HTMLDivElement}
   * @memberof LayersControl
   */
  private container: HTMLDivElement;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly mapService: MapService) {}

  public createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(LayersControlComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.mapService = this.mapService;
    component.instance.layer = 'products';
    component.instance.cdr = component.changeDetectorRef;
    component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>component.location.nativeElement;
  }

  public onAdd() {
    this.container = this.createControlDomContent();
    return this.container;
  }

  public onRemove() {
    this.container?.parentNode?.removeChild(this.container);
  }
}