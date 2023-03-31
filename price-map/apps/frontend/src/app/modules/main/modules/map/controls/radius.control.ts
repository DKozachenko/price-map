import { ComponentFactoryResolver, Injector } from "@angular/core";
import { RadiusControlComponent } from "../components";
import { MapService } from "../services";
import { IControl } from 'maplibre-gl';
import { IMapControl } from "../models/interfaces";

/**
 * Контрол радиуса
 * @export
 * @class RadiusControl
 * @implements {IControl}
 * @implements {IMapControl}
 */
export class RadiusControl implements IControl, IMapControl {
  /**
   * Контейнер
   * @private
   * @type {HTMLDivElement}
   * @memberof RadiusControl
   */
  private container: HTMLDivElement;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly mapService: MapService) {}

  public createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(RadiusControlComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.mapService = this.mapService;
    component.instance.state = false;
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
