import { ProductPopupComponent } from './../components/product-popup/product-popup.component';
import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  createComponent,
  ElementRef,
  Injectable,
  Injector,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FeatureCollection, Point, Feature, GeoJsonProperties } from 'geojson';
import {
  CircleStyleLayer,
  FeatureIndex,
  GeoJSONSource,
  GeoJSONSourceSpecification,
  GeolocateControl,
  LineLayerSpecification,
  LineStyleLayer,
  LngLatLike,
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapMouseEvent,
  Marker,
  NavigationControl,
  Point2D,
  Popup,
  Source,
  SymbolStyleLayer,
} from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';
import { ProductService } from '.';
import { Product } from '@core/entities';
import { IProductInfo } from '../models/interfaces';

@Injectable()
export class MapService {
  private map!: Map;

  private initialPoint: LngLatLike = [82.936, 55.008];

  private productsSourceName: string = 'products';
  private routeSourceName: string = 'route';

  public clicks$: Subject<Point> = new Subject();

  constructor(
    private readonly productService: ProductService,
    private readonly resolver: ComponentFactoryResolver
  ) {}

  private onGeolocate(position: GeolocationPosition): void {
    console.log('GEOLOCATE', position.coords.latitude, position.coords.longitude);
  }

  private setMap(container: ElementRef<HTMLElement>): void {
    this.map = new Map({
      container: container.nativeElement,
      style: '../../../../../assets/mapLibreStyles.json',
      center: this.initialPoint,
      zoom: 12,
    });
  }

  private addControls(): void {
    const navigationContol: NavigationControl = new NavigationControl({
      showCompass: true,
    });
    this.map.addControl(navigationContol, 'top-right');
    const geoControl: GeolocateControl = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    });
    this.map.addControl(geoControl);

    geoControl.on('geolocate', this.onGeolocate);
  }

  private mapProducts(product: Product): Feature<Point, IProductInfo> {
    return {
      type: 'Feature',
      properties: {
        id: product.id,
        price: `${product.price} р.`,
        name: product.name,
        description: product.description
      },
      geometry: {
        type: 'Point',
        coordinates: [
          product.shop.coordinates.longitude,
          product.shop.coordinates.latitude
        ],
      },
    };
  }

  private setFeaturesToJsonSource(features: Feature[]): GeoJSONSourceSpecification {
    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    };
  }

  private setCoordinatesToLineSource(coordinates: number[][]): GeoJSONSourceSpecification {
    return {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    }
  }



  private addLineLayer(): void {
    const lineLayer: LineStyleLayer = <LineStyleLayer>this.map?.getLayer(this.routeSourceName);

    if (lineLayer) {
      lineLayer.source = this.routeSourceName;
    } else {
      this.map?.addLayer({
        id: 'route',
        type: 'line',
        source: this.routeSourceName,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#6699ff',
          'line-width': 8,
        },
      });
    }
  }

  //TODO: стили поковырять
  private addClusterLayer(): void {
    const clustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map?.getLayer('clusters');

    if (clustersLayer) {
      clustersLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: this.productsSourceName,
        filter: [
          'has',
          'point_count'
        ],
        paint: {
          'circle-color': [
            'step',
            [
              'get',
              'point_count'
            ],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            [
              'get',
              'point_count'
            ],
            20,
            100,
            30,
            750,
            40
          ],
        },
      });
    }
  }

  private addClusterCountLayer(): void {
    const clusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map?.getLayer('cluster-count');

    if (clusterCountLayer) {
      clusterCountLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: this.productsSourceName,
        filter: [
          'has',
          'point_count'
        ],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': [
            'DIN Offc Pro Medium',
            'Arial Unicode MS Bold'
          ],
          'text-size': 12,
        },
      });
    }
  }

  private addUnclusteredPointLayer(): void {
    const unclasteredPointLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer('unclustered-point');

    if (unclasteredPointLayer) {
      unclasteredPointLayer.source = this.productsSourceName;
    } else {
      this.map?.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: this.productsSourceName,
        filter: [
          '!',
          [
            'has',
            'point_count'
          ]
        ],
        layout: {
          'icon-image': '{icon}',
          'icon-overlap': 'always',
          'text-field': [
            'get',
            'price'
          ],
          'text-font': ['Open Sans Semibold'],
          'text-size': 18,
          'text-offset': [
            0,
            0.5
          ],
          'text-anchor': 'top',
        },
      });
    }
  }

  private setClusterClick(): void {
    this.map.on('click', 'clusters', (e: MapMouseEvent) => {
      console.log('cluster click', e, e.point);
      const features: MapGeoJSONFeature[] = this.map.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      console.log('features', features);
      const clusterId: number = features[0].properties['cluster_id'];
      const source: GeoJSONSource = <GeoJSONSource>this.map?.getSource(this.productsSourceName);
      console.log(source);
      source?.getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return;

        const geometry: Point = <Point>features?.[0]?.geometry;
        const coordinates: LngLatLike = <LngLatLike>geometry?.coordinates?.slice();
        this.map.easeTo({
          center: coordinates,
          zoom: zoom,
        });
      });
    });
  }

  private setClusterCountClick(): void {
    this.map.on('click', 'cluster-count', (e) => {
      console.log('cluster-count click', e);
    });
  }

  private setUnclusteredPointClick(): void {
    this.map.on('click', 'unclustered-point', (e: MapLayerMouseEvent) => {
      console.log('unclustered-point', e)
      console.log('product click', e?.features);
      const source = <GeoJSONSource>this.map.getSource(this.productsSourceName);
      console.log('source data', source._data);
      const geometry: Point = <Point>e.features?.[0]?.geometry;
      this.clicks$.next(geometry);
      const coordinates: [number, number] = <[number, number]>geometry?.coordinates?.slice();
      coordinates[0] = +coordinates[0].toFixed(6);
      coordinates[1] = +coordinates[1].toFixed(6);
      //Гоняем по сурцам слоя, чтобы выцепить еще фичи с такими координатами
      const features = (<FeatureCollection<Point, GeoJsonProperties>>source._data)?.features?.filter((feature: Feature<Point, GeoJsonProperties>) => {
        // console.log(feature.geometry.coordinates, coordinates)
        return feature.geometry.coordinates[0] === coordinates[0] && feature.geometry.coordinates[1] === coordinates[1];
      });
      console.log('features', 123, features);
      const description = e.features?.[0]?.properties?.['description'];
      const price = e.features?.[0]?.properties?.['price'];
      const name = e.features?.[0]?.properties?.['name'];
      const id = e.features?.[0]?.properties?.['id'];

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const content = this.createPopupDomContent({
        name,
        description,
        id,
        price
      });

      const popup: Popup = new Popup({ className: 'product__popup' })
        .setLngLat(coordinates)
        .setDOMContent(content);

      popup.addTo(this.map);
    });
  }

  private addClusterLayers(): void {
    this.addClusterLayer();
    this.addClusterCountLayer();
    this.addUnclusteredPointLayer();
  }

  private createPopupDomContent(productInfo: IProductInfo): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(ProductPopupComponent);
    // const injector = Injector.create({ providers: [{provide: ProductService, deps: []}] } );
    // const component = componentFactory.create(this.injector);
    const component = componentFactory.create(Injector.create([]));
    component.instance.productInfo = productInfo;
    //Своеобразный DI, тк через через конструктор не вышло
    component.instance.productService = this.productService;
    component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>component.location.nativeElement;
  }

  private setClicks(): void {
    this.setClusterClick();
    this.setClusterCountClick();
    this.setUnclusteredPointClick();
  }

  public addProductsSource(products: Product[]): void {
    const features: Feature[] = products.map((product: Product) => this.mapProducts(product));
    const actualSource: GeoJSONSourceSpecification =  this.setFeaturesToJsonSource(features);

    const productsSource: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(this.productsSourceName);

    if (productsSource) {
      productsSource.setData(<GeoJSON.GeoJSON>actualSource.data);
    } else {
      this.map.addSource(this.productsSourceName, actualSource);
    }

    this.addClusterLayers();
  }

  public addLineSource(coordinates: number[][]): void {
    const actualSource: GeoJSONSourceSpecification = this.setCoordinatesToLineSource(coordinates);

    const routeSource: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(this.routeSourceName);
    if (routeSource) {
      routeSource.setData(<GeoJSON.GeoJSON>actualSource.data);
    } else {
      this.map.addSource(this.routeSourceName, actualSource);
    }

    this.addLineLayer();
  }

  public initMap(container: ElementRef<HTMLElement>): void {
    this.setMap(container);
    this.addControls();
    this.setClicks();
  }

  public removeMap(): void {
    this.map.remove();
  }
}
