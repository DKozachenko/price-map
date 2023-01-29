import { FilterService } from './filter.service';
import { ProductPopupComponent } from './../components/product-popup/product-popup.component';
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, createComponent, ElementRef, Injectable, Injector, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { FeatureCollection, Point } from 'geojson';
import { FeatureIndex, GeoJSONSource, GeolocateControl, Map, Marker, NavigationControl, Popup, Source } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';
import { ProductService } from '.';

@Injectable()
export class MapService {
  public clicks$: Subject<Point> = new Subject();
  // public productIdsToRoute: Set<string> = new Set();
  // public productIdsToRoute$: Subject<Set<string>> = new Subject();
  public map!: Map;

  constructor(private readonly productService: ProductService,
    private readonly resolver: ComponentFactoryResolver,
    private readonly injector: Injector) { }

  public initMap(container: ElementRef<HTMLElement>): void {
    const initialState = { lng: 82.936, lat: 55.008, zoom: 12 };
    // const initialState = { lng: -73, lat: -45, zoom: 14 };
    this.map = new Map({
      container: container.nativeElement,
      style: '../../../../../assets/mapLibreStyles.json',
      center: [
        initialState.lng,
        initialState.lat
      ],
      zoom: initialState.zoom,
    });
  }

  public loadProductImage(): void {
    this.map.loadImage(
      '../../../../assets/wood.png',
      (error: any, image: any) => {
        if (error) throw error;
        if (!this.map?.hasImage('product')) {
          if (image) {
            this.map?.addImage('product', image);
          }
        }
      },
    );
  }

  public addLineLayer(): void {
    const lineLayer = this.map?.getLayer('route');

    if (lineLayer) {
      lineLayer.source = 'route';
    } else {
      this.map?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#6699ff',
          'line-width': 8
        }
      });
    }
  }

  public addClusterLayers(): void {
    const clustersLayer = this.map?.getLayer('clusters');

    if (clustersLayer) {
      clustersLayer.source = 'products';
    } else {
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'products',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ]
        }
      });
    }

    const clusterCountLayer = this.map?.getLayer('cluster-count');

    if (clusterCountLayer) {
      clusterCountLayer.source = 'products';
    } else {
      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'products',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });
    }

    const unclasteredLayer = this.map?.getLayer('unclustered-point');

    if (unclasteredLayer) {
      unclasteredLayer.source  = 'products';
    } else {
      this.map?.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'products',
        filter: ['!', ['has', 'point_count']],
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
          'text-anchor': 'top'
        },
      });
  
    }
    
    this.map.on('click', 'clusters', (e) => {
      console.log('cluster click', e, e.point);
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      console.log('features', features)
      const clusterId = features[0].properties['cluster_id'];
      const source: GeoJSONSource = <GeoJSONSource>this.map?.getSource('products');
      console.log(source)
      source?.getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: any) => {
          if (err) return;

          const geometry = features?.[0]?.geometry as unknown as Point;
          const coordinates = <[number, number]>geometry?.coordinates?.slice();
          this.map.easeTo({
            center: coordinates,
            zoom: zoom
          });
        }
      );
    });
  }


  public addLayer(): void {
    
  }

  public addLineSource(coordinates: number[][]): void {
    const productsSource: any = this.map?.getSource('route');
    if (productsSource) {
      productsSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    } else {
      this.map?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates
          }
        }
      });
    }


    this.addLineLayer();
  }

  public addSource(products: any[]): void {
    let features = products.map((item: any) => {
      return {
        type: 'Feature',
        properties: {
          id: item.id,
          price: `${item.price} р.`,
          name: item.name,
          description: item.description,
          icon: 'product',
        },
        geometry: {
          type: 'Point',
          coordinates: [
            item.shop.coordinates.longitude,
            item.shop.coordinates.latitude
          ],
        },
      };

    });

    const productsSource: any = this.map?.getSource('products');
    if (productsSource) {
      productsSource.setData({
        type: 'FeatureCollection',
        features
      });
    } else {
      this.map?.addSource('products', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
    }

    this.addClusterLayers();
  }

  public createPopupDomContent(productInfo: any): HTMLDivElement {
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

  public addProductIdToRoute(id: string): void {
    this.productService.addProductIdToRoute(id);
  }


  public addControl(): void {
    this.map.addControl(new NavigationControl({}), 'top-right');
    const geoControl = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    })
    this.map.addControl(geoControl);

    geoControl.on('geolocate', (e) => {
      console.log('A geolocate event has occurred.', e.coords.latitude, e.coords.longitude)
    });
    // new Marker({ color: '#FF0000' }).setLngLat([-77.003168, 38.894651]).addTo(this.map);
  }

  public setClicks(): void {
    this.map.on('click', (e: any) => {
      console.log(e);
    });


    this.map.on('click', 'unclustered-point', (e: any) => {
      console.log('product click', e?.features);
      const source = <GeoJSONSource>this.map.getSource('products');
      console.log('source data', source._data)
      const geometry = e?.features?.[0]?.geometry as unknown as Point;
      this.clicks$.next(geometry);
      const coordinates = <[number, number]>geometry?.coordinates?.slice();
      coordinates[0] = +coordinates[0].toFixed(6);
      coordinates[1] = +coordinates[1].toFixed(6);
      //Гоняем по сурцам слоя, чтобы выцепить еще фичи с такими координатами
      const features = (<FeatureCollection>source._data)?.features?.filter((feature: any) => {
        // console.log(feature.geometry.coordinates, coordinates)
        return feature.geometry.coordinates[0] === coordinates[0] && feature.geometry.coordinates[1] === coordinates[1]
      })
      console.log('features', 123, features)
      const description = e?.features?.[0]?.properties?.['description'];
      const name = e?.features?.[0]?.properties?.['name'];
      const id = e?.features?.[0]?.properties?.['id'];

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      // console.log({
      //   name,
      //   description,
      //   id
      // })

      const content = this.createPopupDomContent({
        name,
        description,
        id
      });


      new Popup({ className: 'product__popup' })
        .setLngLat(coordinates)
        .setDOMContent(content)
        .addTo(this.map ?? new Map({ container: '', style: '' }));
    });

    this.map.on('mouseenter', 'places', () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = 'pointer';
      }
    });

    this.map.on('mouseleave', 'places', () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = '';
      }
    });
  }

  public removeMap(): void {
    this.map.remove();
  }
}
