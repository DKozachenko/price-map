import { ComponentFactoryResolver, Injector } from '@angular/core';
import { OnlyFavoriteControlComponent } from '../components';
import { FilterService } from '../services';
import { IControl } from 'maplibre-gl';
import { IMapControl } from '../models/interfaces';

/**
 * Контрол избранных товаров
 * @export
 * @class OnlyFavoriteControl
 * @implements {IControl}
 * @implements {IMapControl}
 */
export class OnlyFavoriteControl implements IControl, IMapControl {
  /**
   * Контейнер
   * @private
   * @type {HTMLDivElement}
   * @memberof OnlyFavoriteControl
   */
  private container: HTMLDivElement;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly filterService: FilterService) {}

  public createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(OnlyFavoriteControlComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.filterService = this.filterService;
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
