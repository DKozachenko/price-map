import { ComponentFactoryResolver, ComponentRef, Injector } from "@angular/core";
import { RadiusControlComponent } from "../components";
import { MapService } from "../services";
import { IControl } from 'maplibre-gl';

export class RadiusControl implements IControl {
  private container: HTMLDivElement;
  private component: ComponentRef<RadiusControlComponent>;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly mapService: MapService) {}

  private createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(RadiusControlComponent);
    this.component = componentFactory.create(Injector.create([]));
    this.component.instance.mapService = this.mapService;
    this.component.instance.state = false;
    this.component.instance.cdr = this.component.changeDetectorRef;
    this.component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>this.component.location.nativeElement;
  }

  public onAdd() {
    this.container = this.createControlDomContent();
    return this.container;
  }

  public onRemove() {
    this.container?.parentNode?.removeChild(this.container);
  }
}
