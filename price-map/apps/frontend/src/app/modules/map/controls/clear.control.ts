import { ComponentFactoryResolver, Injector } from "@angular/core";
import { ClearControlComponent } from "../components";
import { MapService } from "../services";
import {
  IControl,
} from 'maplibre-gl';

export class ClearControl implements IControl {
  private container: HTMLDivElement;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly mapService: MapService) {}

  private createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(ClearControlComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.mapService = this.mapService;
    component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>component.location.nativeElement;
  }

  public onAdd() {
    this.container = this.createControlDomContent();;
    return this.container;
  }

  public onRemove() {
    this.container?.parentNode?.removeChild(this.container);
  }
}