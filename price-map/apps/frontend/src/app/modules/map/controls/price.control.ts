import { ComponentFactoryResolver, Injector } from "@angular/core";
import { PriceControlComponent } from "../components";
import { FilterService } from "../services";
import {
  IControl,
} from 'maplibre-gl';

export class PriceControl implements IControl {
  private container: HTMLDivElement;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly filterService: FilterService) {}

  private createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(PriceControlComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.filterService = this.filterService;
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