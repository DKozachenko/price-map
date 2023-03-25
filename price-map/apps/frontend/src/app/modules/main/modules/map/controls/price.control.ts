import { ComponentFactoryResolver, ComponentRef, Injector } from "@angular/core";
import { PriceControlComponent } from "../components";
import { FilterService } from "../services";
import { IControl } from 'maplibre-gl';

export class PriceControl implements IControl {
  private container: HTMLDivElement;
  private component: ComponentRef<PriceControlComponent>;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly filterService: FilterService) {}

  private createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(PriceControlComponent);
    this.component = componentFactory.create(Injector.create([]));
    this.component.instance.filterService = this.filterService;
    this.component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>this.component.location.nativeElement;
  }

  public onAdd() {
    this.container = this.createControlDomContent();
    return this.container;
  }

  public onRemove() {
    this.component.instance.destroySlider();
    this.container?.parentNode?.removeChild(this.container);
  }
}
