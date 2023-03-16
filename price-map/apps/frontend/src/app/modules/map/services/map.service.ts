import { Subject } from 'rxjs';
import {
  ComponentFactoryResolver,
  ElementRef,
  Injectable,
  Injector
} from '@angular/core';
import { FeatureCollection, Point, Feature } from 'geojson';
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
import { IProductInfo, IShopInfo } from '../models/interfaces';
import { ClearControl, LayersControl, PriceControl } from '../controls';
import { WebSocketService } from '../../../services';
import { LayerType } from '../models/types';
import { ShopPopupComponent, ProductPopupComponent } from '../components';

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

  /**
   * Id слоя для кластеризации
   * @private
   * @type {string}
   * @memberof MapService
   */
  private clusterLayerId: string = 'clusters';

  /**
   * Id слоя с счетчиками кластеризации
   * @private
   * @type {string}
   * @memberof MapService
   */
  private clusterCountLayerId: string = 'cluster-count';

  /**
   * Id слоя с некластеризированными элементами
   * @private
   * @type {string}
   * @memberof MapService
   */
  private unclusterPointLayerId: string = 'unclustered-point';

  private unclusterCountLayerId: string = 'uncluster-count';

  public currentLayer$: Subject<LayerType> = new Subject<LayerType>();

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

  public loadProductImage(): void {
    this.map.loadImage(
      '../../../../assets/wood.png',
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
    const clustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(this.clusterLayerId);
    if (clustersLayer) {
      this.map.removeLayer(this.clusterLayerId);
    }
    const clusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.clusterCountLayerId);
    if (clusterCountLayer) {
      this.map.removeLayer(this.clusterCountLayerId);
    }
    const unclasteredPointLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.unclusterPointLayerId);
    if (unclasteredPointLayer) {
      this.map.removeLayer(this.unclusterPointLayerId);
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

  /**
   * Установка события на клик по слою кластеризации
   * @private
   * @memberof MapService
   */
  private setClusterClick(): void {
    this.map.on('click', this.clusterLayerId, (e: MapMouseEvent) => {
      console.log('cluster click', e, e.point);
      const features: MapGeoJSONFeature[] = this.map.queryRenderedFeatures(e.point, {
        layers: [this.clusterLayerId],
      });

      const clusterId: number = features[0].properties['cluster_id'];
      const source: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(this.productsSourceName);

      source?.getClusterExpansionZoom(clusterId, (error?: Error | null, zoom?: number | null) => {
        if (error) return;

        const geometry: Point = <Point>features?.[0]?.geometry;
        const coordinates: LngLatLike = <LngLatLike>geometry?.coordinates?.slice();
        this.map.easeTo({
          center: coordinates,
          zoom: zoom ?? 1,
        });
      });
    });
  }

  /**
   * Установка события на клик по слою с счетчиками
   * @memberof MapService
   */
  private setClusterCountClick(): void {
    this.map.on('click', this.clusterCountLayerId, (e) => {
      console.log('cluster-count click', e);
    });
  }

  /**
   * Получение фич по переданным координатам из источника данных
   * @private
   * @param {[number, number]} coordinates координаты
   * @return {*}  {Feature<Point, IProductInfo>[]} фичи
   * @memberof MapService
   */
  private featuresByCoordinates(coordinates: [number, number]): Feature<Point, IProductInfo>[] {
    coordinates[0] = +coordinates[0].toFixed(6);
    coordinates[1] = +coordinates[1].toFixed(6);
    const source: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(this.productsSourceName);
    //Гоняем по сурцам слоя, чтобы выцепить еще фичи с такими координатами
    return (<FeatureCollection<Point, IProductInfo>>source?._data)?.features?.filter(
      (feature: Feature<Point, IProductInfo>) =>
        feature.geometry.coordinates[0] === coordinates[0] && feature.geometry.coordinates[1] === coordinates[1],
    );
  }

  /**
   * Создание HTML контента для попапа
   * @private
   * @param {IProductInfo} productInfo инцормация о товаре
   * @return {*}  {HTMLDivElement} див
   * @memberof MapService
   */
  private createProductPopupDomContent(productInfo: IProductInfo): HTMLDivElement {
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

  private createShopPopupDomContent(shopInfo: IShopInfo): HTMLDivElement {
    const componentFactory = this.resolver.resolveComponentFactory(ShopPopupComponent);
    const component = componentFactory.create(Injector.create([]));
    component.instance.shopInfo = shopInfo;
    component.changeDetectorRef.detectChanges();
    return <HTMLDivElement>component.location.nativeElement;
  }

  /**
   * Установка события на клик по слою некластеризированных объектов
   * @private
   * @memberof MapService
   */
  private setUnclusteredPointClick(): void {
    this.map.on('click', this.unclusterPointLayerId, (e: MapLayerMouseEvent) => {
      console.log('unclustered-point', e);
      const feature: Feature<Point, IProductInfo> = <Feature<Point, IProductInfo>>e.features?.[0];
      const geometry: Point = feature?.geometry;
      const coordinates: [number, number] = <[number, number]>geometry?.coordinates?.slice();
      const featuresByCoordinates: Feature<Point, IProductInfo>[] = this.featuresByCoordinates(coordinates);

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      const content = this.createProductPopupDomContent(feature.properties);
      const popup: Popup = new Popup({ className: 'custom__popup' }).setLngLat(coordinates).setDOMContent(content);
      popup.addTo(this.map);
    });
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

  /**
   * Установка всех событий кликов
   * @private
   * @memberof MapService
   */
  private setClicks(): void {
    this.setClusterClick();
    this.setClusterCountClick();
    this.setUnclusteredPointClick();
    this.setShopPointClick();
  }

  /**
   * Преобразования товара из БД в фичу
   * @private
   * @param {Product} product товар
   * @return {*}  {Feature<Point, IProductInfo>} фича (координаты в формате {longitude},{latitude})
   * @memberof MapService
   */
  private mapProduct(product: Product): Feature<Point, IProductInfo> {
    return {
      type: 'Feature',
      properties: {
        id: product.id,
        price: `${product.price} р.`,
        name: product.name,
        description: product.description,
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
  private setFeaturesToJsonSource(features: Feature<Point, IProductInfo | IShopInfo>[]): GeoJSONSourceSpecification {
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

  //TODO: стили поковырять
  /**
   * Добавление слоя кластеризации
   * @private
   * @memberof MapService
   */
  private addClusterLayer(): void {
    const clustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(this.clusterLayerId);

    if (clustersLayer) {
      clustersLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.clusterLayerId,
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

  /**
   * Добавление слоя с счетчиками класстеризированных элементов
   * @private
   * @memberof MapService
   */
  private addClusterCountLayer(): void {
    const clusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.clusterCountLayerId);

    if (clusterCountLayer) {
      clusterCountLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.clusterCountLayerId,
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

  /**
   * Добавление слоя для некластеризированных точек
   * @private
   * @memberof MapService
   */
  private addUnclusteredPointLayer(): void {
    const unclasteredPointLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.unclusterPointLayerId);

    if (unclasteredPointLayer) {
      unclasteredPointLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.unclusterPointLayerId,
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
          'circle-color': '#11b4da',
          'circle-radius': 20
        },
      });
    }
  }

  private addUnclusterCountLayer(): void {
    const unclusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(this.unclusterCountLayerId);

    if (unclusterCountLayer) {
      unclusterCountLayer.source = this.productsSourceName;
    } else {
      this.map.addLayer({
        id: this.unclusterCountLayerId,
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

  /**
   * Добавление слоев для кластеризации
   * @private
   * @memberof MapService
   */
  private addClusterLayers(): void {
    this.addClusterLayer();
    this.addClusterCountLayer();
    this.addUnclusteredPointLayer();
    this.addUnclusterCountLayer();
  }

  /**
   * Добавления источника данных для товаров
   * @private
   * @param {Product[]} products товары
   * @memberof MapService
   */
  private addProductsSource(products: Product[]): void {
    const features: Feature<Point, IProductInfo>[] = products.map((product: Product) => this.mapProduct(product));
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
      const clustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(this.clusterLayerId);
      this.map.moveLayer(this.routeLayerId, clustersLayer ? this.clusterLayerId : undefined);
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
    this.addClusterLayers();
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
