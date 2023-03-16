import { Subject } from 'rxjs';
import {
  ComponentFactoryResolver,
  ElementRef,
  Injectable,
  Injector
} from '@angular/core';
import { Point, Feature, Geometry, GeoJsonProperties } from 'geojson';
import {
  CircleStyleLayer,
  GeoJSONSource,
  GeoJSONSourceSpecification,
  GeolocateControl,
  IControl,
  LineStyleLayer,
  LngLatLike,
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  MapMouseEvent,
  NavigationControl,
  Popup,
  SymbolStyleLayer
} from 'maplibre-gl';
import { FilterService, ProductService } from '.';
import { Product, Shop } from '@core/entities';
import { IFeatureProps, IShopInfo } from '../models/interfaces';
import { ClearControl, LayersControl, PriceControl } from '../controls';
import { WebSocketService } from '../../../services';
import { LayerType } from '../models/types';
import { ShopPopupComponent } from '../components';

/**
 * Сервис по работе с картой
 * @export
 * @class MapService
 */
@Injectable()
export class MapService {
  /**
   * Карта
   * @private
   * @type {Map}
   * @memberof MapService
   */
  private map!: Map;

  /**
   * Начальная точка
   * @private
   * @type {LngLatLike}
   * @memberof MapService
   */
  private initialPoint: LngLatLike = [
    82.936,
    55.008
  ];

  /**
   * Название источника данных для товаров
   * @private
   * @type {string}
   * @memberof MapService
   */
  private productsSourceName: string = 'products';
  /**
   * Id слоя для кластеризации
   * @private
   * @type {string}
   * @memberof MapService
   */
  private productClusterLayerId: string = 'product-cluster';
  /**
   * Id слоя с счетчиками кластеризации
   * @private
   * @type {string}
   * @memberof MapService
   */
  private productClusterCountLayerId: string = 'product-cluster-count';

  /**
   * Id слоя с некластеризированными элементами
   * @private
   * @type {string}
   * @memberof MapService
   */
  private productUnclusterLayerId: string = 'product-uncluster';

  private productUnclusterCountLayerId: string = 'product-uncluster-count';

  private shopsSourceName: string = 'shops';
  private shopLayerId: string = 'shop';

  /**
   * Название источника данных для маршрута
   * @private
   * @type {string}
   * @memberof MapService
   */
  private routeSourceName: string = 'route';

  /**
   * Id слоя для маршрута
   * @private
   * @type {string}
   * @memberof MapService
   */
  private routeLayerId: string = 'route';

  public currentLayer$: Subject<LayerType> = new Subject<LayerType>();

  public colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];

  constructor(private readonly productService: ProductService,
    private readonly webSocketService: WebSocketService,
    private readonly filterService: FilterService,
    private readonly resolver: ComponentFactoryResolver) { }

  /**
   * Создание экземпляра карты и привязка к контейнеру
   * @private
   * @param {ElementRef<HTMLElement>} container контейнер
   * @memberof MapService
   */
  private setMap(container: ElementRef<HTMLElement>): void {
    this.map = new Map({
      container: container.nativeElement,
      style: '../../../../../assets/mapLibreStyles.json',
      center: this.initialPoint,
      zoom: 12,
    });
  }

  /**
   * Событие при установке геолокации
   * @private
   * @param {GeolocationPosition} position геолокация
   * @memberof MapService
   */
  private onGeolocate(position: GeolocationPosition): void {
    console.log('GEOLOCATE', position.coords.latitude, position.coords.longitude);
  }

  private centerMap(coordinates: LngLatLike): void {
    this.map.easeTo({
      center: coordinates,
      zoom: 15,
    });
  }

  public loadShopImage(): void {
    this.map.loadImage(
      '../../../../assets/shop.png',
      (error: any, image: any) => {
        if (error) throw error;
        if (!this.map?.hasImage('shop')) {
          if (image) {
            this.map?.addImage('shop', image);
          }
        }
      },
    );
  }

  public removeAllLayers(): void {
    const productClusterLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(this.productClusterLayerId);
    if (productClusterLayer) {
      this.map.removeLayer(this.productClusterLayerId);
    }
    const productClusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.productClusterCountLayerId);
    if (productClusterCountLayer) {
      this.map.removeLayer(this.productClusterCountLayerId);
    }
    const productUnclasteredLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.productUnclusterLayerId);
    if (productUnclasteredLayer) {
      this.map.removeLayer(this.productUnclusterLayerId);
    }
    const lineLayer: LineStyleLayer = <LineStyleLayer>this.map.getLayer(this.routeLayerId);
    if (lineLayer) {
      this.map.removeLayer(this.routeLayerId);
    }
    const shopLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.shopLayerId);
    if (shopLayer) {
      this.map.removeLayer(this.shopLayerId);
    }
  }

  /**
   * Добавление контролов
   * @private
   * @memberof MapService
   */
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
    geoControl.on('geolocate', this.onGeolocate);
    this.map.addControl(geoControl);

    const layersControl: LayersControl = new LayersControl(this.resolver, this, this.webSocketService);
    this.map.addControl(layersControl, 'top-left');
    this.addPriceControl();
  }

  public addPriceControl(): void {
    const priceControl: PriceControl = new PriceControl(this.resolver, this.filterService);
    this.map.addControl(priceControl, 'top-left');
  }

  public addClearControl(): void {
    const clearControl: ClearControl = new ClearControl(this.resolver, this);
    this.map.addControl(clearControl, 'top-right');
  }

  public removeClearControl(): void {
    const clearControl: ClearControl | undefined
      = <ClearControl | undefined>this.map._controls.find((control: IControl) => control instanceof ClearControl);
    if (clearControl) {
      this.map.removeControl(clearControl);
    }
  }

  public removePriceControl(): void {
    const priceControl: PriceControl | undefined
      = <PriceControl | undefined>this.map._controls.find((control: IControl) => control instanceof PriceControl);
    if (priceControl) {
      this.map.removeControl(priceControl);
    }
  }

  private createShopPopupDomContent(shopInfo: IShopInfo): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(ShopPopupComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.shopInfo = shopInfo;
    component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>component.location.nativeElement;
  }

  private setShopPointClick(): void {
    this.map.on('click', this.shopLayerId, (e: MapLayerMouseEvent) => {
      console.log('shop-layer', e);
      const feature: Feature<Point, IShopInfo> = <Feature<Point, IShopInfo>>e.features?.[0];
      const geometry: Point = feature?.geometry;
      const coordinates: [number, number] = <[number, number]>geometry?.coordinates?.slice();

      const content = this.createShopPopupDomContent(feature.properties);
      const popup: Popup = new Popup({ className: 'custom__popup' }).setLngLat(coordinates).setDOMContent(content);
      popup.addTo(this.map);
    });
  }

  private setProductUnclusterClick(): void {
    this.map.on('click', this.productUnclusterLayerId, (e: MapLayerMouseEvent) => {
      const feature: Feature<Point, IFeatureProps> = <Feature<Point, IFeatureProps>>e.features?.[0];
      console.log(feature)
      const geometry: Point = feature?.geometry;
      const coordinates: [number, number] = <[number, number]>geometry?.coordinates?.slice();
      this.centerMap(coordinates);
    });
  }

  private setProductClusterClick(): void {
    this.map.on('click', this.productClusterLayerId, (e: MapMouseEvent) => {
      const features: MapGeoJSONFeature[] = this.map.queryRenderedFeatures(e.point, {
        layers: [this.productClusterLayerId],
      });

      const clusterId: number = features[0].properties['cluster_id'];
      const pointCount: number = features[0].properties['point_count'];
      const source: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(this.productsSourceName);

      if (source) {
        source.getClusterExpansionZoom(clusterId, (error?: Error | null, zoom?: number | null) => {
          if (error) return;
          const geometry: Point = <Point>features?.[0]?.geometry;
          const coordinates: LngLatLike = <LngLatLike>geometry?.coordinates?.slice();
          this.centerMap(coordinates);
        });
  
        
        source.getClusterLeaves(clusterId, pointCount, 0, (error?: Error | null, data?: Feature<Geometry, GeoJsonProperties>[] | null) => {
          if (error) return;
          const features: Feature<Point, IFeatureProps>[] = <Feature<Point, IFeatureProps>[]>data;
          console.log('getClusterLeaves', features)
        })
      }
      
    });
  }

  /**
   * Установка всех событий кликов
   * @private
   * @memberof MapService
   */
  private setClicks(): void {
    this.setProductClusterClick();
    this.setProductUnclusterClick();
    this.setShopPointClick();
  }

  private mapProduct(product: Product): Feature<Point, IFeatureProps> {
    return {
      type: 'Feature',
      properties: {
        id: product.id
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

  private mapShop(shop: Shop): Feature<Point, IShopInfo & { icon: string }> {
    return {
      type: 'Feature',
      properties: {
        id: shop.id,
        name: shop.name,
        productNumber: shop.products.length.toString(),
        website: shop.website ?? '',
        osmNodeId: shop.osmNodeId,
        icon: 'shop'
      },
      geometry: {
        type: 'Point',
        coordinates: [
          shop.coordinates.longitude,
          shop.coordinates.latitude
        ],
      },
    };
  }

  /**
   * Установка фич для источника данных JSON
   * @private
   * @param {Feature[]} features фичи
   * @return {*}  {GeoJSONSourceSpecification} источник данных с переданными фичами
   * @memberof MapService
   */
  private setFeaturesToJsonSource(features: Feature<Point, IFeatureProps | IShopInfo>[]): GeoJSONSourceSpecification {
    return {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
      cluster: true,
      //24 - максимальный зум для карты
      clusterMaxZoom: 25,
      clusterRadius: 50,
    };
  }

  /**
   * Добавление слоя кластеризации
   * @private
   * @memberof MapService
   */
  private addProductClusterLayer(): void {
    const productClustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(this.productClusterLayerId);

    if (productClustersLayer) {
      productClustersLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.productClusterLayerId,
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
            '#a16eff',
            100,
            '#323259'
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

  /**
   * Добавление слоя с счетчиками класстеризированных элементов
   * @private
   * @memberof MapService
   */
  private addProductClusterCountLayer(): void {
    const productClusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.productClusterCountLayerId);

    if (productClusterCountLayer) {
      productClusterCountLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.productClusterCountLayerId,
        type: 'symbol',
        source: this.productsSourceName,
        filter: [
          'has',
          'point_count'
        ],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Consolas'],
          'text-size': 12,
        },
      });
    }
  }

  /**
   * Добавление слоя для некластеризированных точек
   * @private
   * @memberof MapService
   */
  private addProductUnclusterLayer(): void {
    const productUnclasteredLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.productUnclusterLayerId);

    if (productUnclasteredLayer) {
      productUnclasteredLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.productUnclusterLayerId,
        type: 'circle',
        source: this.productsSourceName,
        filter: [
          '!',
          [
            'has',
            'point_count'
          ]
        ],
        paint: {
          'circle-color': '#a16eff',
          'circle-radius': 20
        },
      });
    }
  }

  private addProductUnclusterCountLayer(): void {
    const productUnclusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.productUnclusterCountLayerId);

    if (productUnclusterCountLayer) {
      productUnclusterCountLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.productUnclusterCountLayerId,
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
          'text-field': '1',
          'text-font': [
            'DIN Offc Pro Medium',
            'Arial Unicode MS Bold'
          ],
          'text-size': 12,
        },
      });
    }
  }


  private addProductLayers(): void {
    this.addProductClusterLayer();
    this.addProductClusterCountLayer();
    this.addProductUnclusterLayer();
    this.addProductUnclusterCountLayer();
  }

  /**
   * Добавления источника данных для товаров
   * @private
   * @param {Product[]} products товары
   * @memberof MapService
   */
  private addProductsSource(products: Product[]): void {
    const features: Feature<Point, IFeatureProps>[] = products.map((product: Product) => this.mapProduct(product));
    const actualSource: GeoJSONSourceSpecification = this.setFeaturesToJsonSource(features);

    const productsSource: GeoJSONSource | undefined = <GeoJSONSource | undefined>(
      this.map.getSource(this.productsSourceName)
    );

    if (productsSource) {
      productsSource.setData(<GeoJSON.GeoJSON>actualSource.data);
    } else {
      this.map.addSource(this.productsSourceName, actualSource);
    }
  }

  private addShopsSource(shops: Shop[]): void {
    const features: Feature<Point, IShopInfo>[] = shops.map((shop: Shop) => this.mapShop(shop));
    const actualSource: GeoJSONSourceSpecification = this.setFeaturesToJsonSource(features);

    const shopsSource: GeoJSONSource | undefined = <GeoJSONSource | undefined>(
      this.map.getSource(this.shopsSourceName)
    );

    if (shopsSource) {
      shopsSource.setData(<GeoJSON.GeoJSON>actualSource.data);
    } else {
      this.map.addSource(this.shopsSourceName, actualSource);
    }
  }

  /**
   * Установка координат для источника данных для маршрута
   * @private
   * @param {number[][]} coordinates координаты
   * @return {*}  {GeoJSONSourceSpecification} источник данных с переданными координатами
   * @memberof MapService
   */
  private setCoordinatesToRouteSource(coordinates: number[][]): GeoJSONSourceSpecification {
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
    };
  }

  /**
   * Добавления слоя для маршрута
   * @private
   * @memberof MapService
   */
  private addRouteLayer(): void {
    const lineLayer: LineStyleLayer = <LineStyleLayer>this.map.getLayer(this.routeLayerId);

    if (lineLayer) {
      lineLayer.source = this.routeSourceName;
    } else {
      this.map.addLayer({
        id: this.routeLayerId,
        type: 'line',
        source: this.routeSourceName,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#6699ff',
          'line-width': 4,
        },
      });

      //Перемещаем слой с маршрутом "под" кластеризованный слой
      const productClustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(this.productClusterLayerId);
      this.map.moveLayer(this.routeLayerId, productClustersLayer ? this.productClusterLayerId : undefined);
    }

    this.addClearControl();
  }

  private addShopsLayer(): void {
    const shopLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.shopLayerId);

    if (shopLayer) {
      shopLayer.source = this.shopsSourceName;
    } else {
      this.map.addLayer({
        id: this.shopLayerId,
        type: 'symbol',
        source: this.shopsSourceName,
        layout: {
          'icon-size': 1,
          'icon-image': 'shop',
          'icon-overlap': 'always',
          'text-field': [
            'get',
            'name'
          ],
          'text-font': ['Consolas'],
          'text-size': 14,
          'text-offset': [
            0,
            0.75
          ],
          'text-anchor': 'top'
        }
      });
    }
  }

  public removeRouteLayer(): void {
    const lineLayer: LineStyleLayer = <LineStyleLayer>this.map.getLayer(this.routeSourceName);

    if (lineLayer) {
      this.map.removeLayer(this.routeSourceName);
    }

    this.removeClearControl();
  }

  /**
   * Добавление источника данных для маршрута
   * @private
   * @param {number[][]} coordinates координаты
   * @memberof MapService
   */
  private addRouteSource(coordinates: number[][]): void {
    const actualSource: GeoJSONSourceSpecification = this.setCoordinatesToRouteSource(coordinates);

    const routeSource: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(this.routeSourceName);
    if (routeSource) {
      routeSource.setData(<GeoJSON.GeoJSON>actualSource.data);
    } else {
      this.map.addSource(this.routeSourceName, actualSource);
    }
  }

  /**
   * Добавление товаров на карту
   * @param {Product[]} products товары
   * @memberof MapService
   */
  public addProducts(products: Product[]): void {
    this.addProductsSource(products);
    this.addProductLayers();
  }

  /**
   * Добавление маршрута на карту
   * @param {number[][]} coordinates
   * @memberof MapService
   */
  public addRoute(coordinates: number[][]): void {
    this.addRouteSource(coordinates);
    this.addRouteLayer();
  }

  public addShops(shops: Shop[]): void {
    this.addShopsSource(shops);
    this.addShopsLayer();
  }

  /**
   * Инициализация карты (привязка к контейнеру, добавление контролов, установка событий на клики)
   * @param {ElementRef<HTMLElement>} container контейнер для карты
   * @memberof MapService
   */
  public initMap(container: ElementRef<HTMLElement>): void {
    this.setMap(container);
    this.loadShopImage();
    this.addControls();
    this.setClicks();
  }

  /**
   * Удаление карты
   * @memberof MapService
   */
  public removeMap(): void {
    this.map.remove();
  }
}
