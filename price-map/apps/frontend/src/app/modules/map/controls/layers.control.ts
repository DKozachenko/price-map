import { ComponentFactoryResolver, Injector } from "@angular/core";
import { LayersControlComponent } from "../components";
import { MapService } from "../services";
import {
  IControl,
} from 'maplibre-gl';
import { WebSocketService } from "../../../services";

export class LayersControl implements IControl {
  private container: HTMLDivElement;

  constructor(private readonly resolver: ComponentFactoryResolver,
    private readonly mapService: MapService,
    private readonly webSocketService: WebSocketService) {}

  private createControlDomContent(): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(LayersControlComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.mapService = this.mapService;
    component.instance.webSocketService = this.webSocketService;
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