import { Observable, Subject } from 'rxjs';
import { ComponentFactoryResolver,
  ElementRef,
  Injectable } from '@angular/core';
import { Point, Feature, Geometry, GeoJsonProperties } from 'geojson';
import { CircleStyleLayer,
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
  SymbolStyleLayer } from 'maplibre-gl';
import * as maplibreGl from 'maplibre-gl-draw-circle';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { FilterService, ShopService } from '.';
import { Product, Shop } from '@core/entities';
import { IFeatureProps } from '../models/interfaces';
import { ClearControl, LayersControl, OnlyFavoriteControl, PriceControl, RadiusControl } from '../controls';
import { ProductService } from '../../../services';
import { LayerType } from '../models/types';
import { BaseSidebar } from '../../../classes';

/**
 * Сервис-стор по работе с картой
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
   * Название источника данных для товаров
   * @private
   * @type {string}
   * @memberof MapService
   */
  private shopsSourceName: string = 'shops';

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
   * Текущий слой
   * @private
   * @type {LayerType}
   * @memberof MapService
   */
  private currentLayerValue: LayerType = 'products';

  /**
   * Подписка на изменение текущего слоя
   * @private
   * @type {Subject<LayerType>}
   * @memberof MapService
   */
  private currentLayer: Subject<LayerType> = new Subject<LayerType>();

  /**
   * Подписка на изменение текущего слоя (публичная)
   * @type {Observable<LayerType>}
   * @memberof MapService
   */
  public currentLayer$: Observable<LayerType> = this.currentLayer.asObservable();

  /**
   * Событие смены текущего слоя
   * @param {LayerType} newLayer текущий слоя
   * @memberof MapService
   */
  public emitSettingCurrentLayer(newLayer: LayerType): void {
    this.currentLayerValue = newLayer;
    this.currentLayer.next(newLayer);
  }

  constructor(private readonly productService: ProductService,
    private readonly shopService: ShopService,
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

  /**
   * Событие при обновлении кфдиуса
   * @private
   * @param {*} event событие
   * @memberof MapService
   */
  private onRadiusUpdate(event: any): void {
    const center: [number, number] = event?.features?.[0]?.properties?.center;
    const radiusInKm: number = event?.features?.[0]?.properties?.radiusInKm;
    if (center && radiusInKm) {
      this.filterService.emitSettingRadiusQuery({
        center: {
          latitude: center[1],
          longitude: center[0]
        },
        distance: radiusInKm * 1000
      });
    }
  }

  /**
   * Центрирование карты на определенной точке
   * @private
   * @param {LngLatLike} coordinates координаты точки
   * @memberof MapService
   */
  private centerMap(coordinates: LngLatLike): void {
    this.map.easeTo({
      center: coordinates,
      zoom: 15,
    });
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

    this.addRadiusControl();
    this.addOnlyFavoriteControl();

    const layersControl: LayersControl = new LayersControl(this.resolver, this);
    this.map.addControl(layersControl, 'top-left');
    this.addPriceControl();
  }

  /**
   * Установка клика на некластеризированный слой
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private setUnclusterClick(sourceName: string, service: BaseSidebar): void {
    const layerId: string = `${sourceName}-uncluster`;
    this.map.on('click', layerId, (e: MapLayerMouseEvent) => {
      const feature: Feature<Point, IFeatureProps> = <Feature<Point, IFeatureProps>>e.features?.[0];
      const geometry: Point = feature?.geometry;
      const coordinates: [number, number] = <[number, number]>geometry?.coordinates?.slice();
      this.centerMap(coordinates);
      this.removeDrawControl();
      service.emitSettingItemIdToShow([feature.properties.id]);
    });
  }

  /**
   * Установка клика на кластеризированный слой
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private setClusterClick(sourceName: string, service: BaseSidebar): void {
    const layerId: string = `${sourceName}-cluster`;
    this.map.on('click', layerId, (e: MapMouseEvent) => {
      const features: MapGeoJSONFeature[] = this.map.queryRenderedFeatures(e.point, {
        layers: [layerId],
      });

      const clusterId: number = features[0].properties['cluster_id'];
      const pointCount: number = features[0].properties['point_count'];
      const source: GeoJSONSource | undefined = <GeoJSONSource | undefined>this.map.getSource(sourceName);

      if (source) {
        source.getClusterExpansionZoom(clusterId, (error?: Error | null, zoom?: number | null) => {
          if (error) return;
          const geometry: Point = <Point>features?.[0]?.geometry;
          const coordinates: LngLatLike = <LngLatLike>geometry?.coordinates?.slice();
          this.centerMap(coordinates);
        });


        source.getClusterLeaves(clusterId, pointCount, 0,
          (error?: Error | null, data?: Feature<Geometry, GeoJsonProperties>[] | null) => {
            if (error) return;
            const features: Feature<Point, IFeatureProps>[] = <Feature<Point, IFeatureProps>[]>data;
            const itemIds: string[] = features.map((feature: Feature<Point, IFeatureProps>) => feature.properties.id);
            service.emitSettingItemIdToShow(itemIds);
          });
      }

    });
  }

  /**
   * Преобразование товара в GeoJson
   * @private
   * @param {Product} product товар
   * @return {*}  {Feature<Point, IFeatureProps>} JSON фича
   * @memberof MapService
   */
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

  /**
   * Преобразование магазина в GeoJson
   * @private
   * @param {Shop} shop магазин
   * @return {*}  {Feature<Point, IFeatureProps>} JSON фича
   * @memberof MapService
   */
  private mapShop(shop: Shop): Feature<Point, IFeatureProps> {
    return {
      type: 'Feature',
      properties: {
        id: shop.id,
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
  private setFeaturesToJsonSource(features: Feature<Point, IFeatureProps>[]): GeoJSONSourceSpecification {
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
      const productClusterLayerId: string = `${this.productsSourceName}-cluster`;
      const productClustersLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(productClusterLayerId);
      this.map.moveLayer(this.routeLayerId, productClustersLayer ? productClusterLayerId : undefined);
    }

    this.addClearControl();
  }

  /**
   * Добавление кластеризованного слоя
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private addClusterLayer(sourceName: string): void {
    const layerId: string = `${sourceName}-cluster`;
    const clusterLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(layerId);

    if (clusterLayer) {
      clusterLayer.source = sourceName;
    } else {
      this.map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceName,
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
            '#894df7',
            250,
            '#6835c4',
            500,
            '#451896',
            1000,
            '#300b73',
            1750,
            '#240954'
          ],
          'circle-radius': [
            'step',
            [
              'get',
              'point_count'
            ],
            15,
            100,
            20,
            250,
            25,
            500,
            30,
            1000,
            35,
            1750,
            40
          ],
        },
      });
    }
  }

  /**
   * Добавление слоя счетчиков для кластеризованного слоя
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private addClusterCountLayer(sourceName: string): void {
    const layerId: string = `${sourceName}-cluster-count`;
    const clusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(layerId);

    if (clusterCountLayer) {
      clusterCountLayer.source = sourceName;
    } else {
      this.map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceName,
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
   * Добавление некластеризованного слоя
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private addUnclusterLayer(sourceName: string): void {
    const layerId: string = `${sourceName}-uncluster`;
    const unclasterLayer: CircleStyleLayer = <CircleStyleLayer>this.map.getLayer(layerId);

    if (unclasterLayer) {
      unclasterLayer.source = sourceName;
    } else {
      this.map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceName,
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

  /**
   * Добавление слоя счетчиков для некластеризованного слоя
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private addUnclusterCountLayer(sourceName: string): void {
    const layerId: string = `${sourceName}-uncluster-count`;
    const unclusterCountLayer: SymbolStyleLayer = <SymbolStyleLayer>this.map.getLayer(layerId);

    if (unclusterCountLayer) {
      unclusterCountLayer.source = sourceName;
    } else {
      this.map.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceName,
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
   * Добавление источника данных для слоев
   * @private
   * @template T тип исходных данных
   * @param {string} sourceName название иточника
   * @param {T[]} data данные
   * @param {Function} mapCallback колбэк для преобразования в GeoJson
   * @memberof MapService
   */
  //eslint-disable-next-line @typescript-eslint/ban-types
  private addClusterSource<T = any>(sourceName: string, data: T[], mapCallback: Function): void {
    const features: Feature<Point, IFeatureProps>[] = data.map((item: T) => mapCallback(item));
    const actualSource: GeoJSONSourceSpecification = this.setFeaturesToJsonSource(features);

    const existedSource: GeoJSONSource | undefined = <GeoJSONSource | undefined>(
      this.map.getSource(sourceName)
    );

    if (existedSource) {
      existedSource.setData(<GeoJSON.GeoJSON>actualSource.data);
    } else {
      this.map.addSource(sourceName, actualSource);
    }
  }

  /**
   * Добавление слоев для кластеризации
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private addClusterLayers(sourceName: string): void {
    this.addClusterLayer(sourceName);
    this.addClusterCountLayer(sourceName);
    this.addUnclusterLayer(sourceName);
    this.addUnclusterCountLayer(sourceName);
  }

  /**
   * Установка кликов на слои для кластеризации
   * @private
   * @param {string} sourceName название источника данных
   * @memberof MapService
   */
  private setClusterLayersClicks(sourceName: string, service: ProductService | ShopService): void {
    this.setClusterClick(sourceName, service);
    this.setUnclusterClick(sourceName, service);
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
   * Добавление контрола цены
   * @memberof MapService
   */
  public addPriceControl(): void {
    const existedPriceControl: PriceControl | undefined
      = <PriceControl | undefined>this.map._controls.find((control: IControl) => control instanceof PriceControl);

    if (!existedPriceControl) {
      const priceControl: PriceControl = new PriceControl(this.resolver, this.filterService);
      this.map.addControl(priceControl, 'top-left');
    }
  }

  /**
   * Удаление контрола цены
   * @memberof MapService
   */
  public removePriceControl(): void {
    const priceControl: PriceControl | undefined
      = <PriceControl | undefined>this.map._controls.find((control: IControl) => control instanceof PriceControl);
    if (priceControl) {
      this.map.removeControl(priceControl);
    }
  }

  /**
   * Добавление контрола для очистки карты
   * @memberof MapService
   */
  public addClearControl(): void {
    const existedClearControl: ClearControl | undefined
      = <ClearControl | undefined>this.map._controls.find((control: IControl) => control instanceof ClearControl);

    if (!existedClearControl) {
      const clearControl: ClearControl = new ClearControl(this.resolver, this);
      this.map.addControl(clearControl, 'top-right');
    }
  }

  /**
   * Удаление контрола для очистки карты
   * @memberof MapService
   */
  public removeClearControl(): void {
    const clearControl: ClearControl | undefined
      = <ClearControl | undefined>this.map._controls.find((control: IControl) => control instanceof ClearControl);
    if (clearControl) {
      this.map.removeControl(clearControl);
    }
  }

  /**
   * Добавление контрола для радиуса
   * @memberof MapService
   */
  public addRadiusControl(): void {
    const existedRadiusControl: RadiusControl | undefined
      = <RadiusControl | undefined>this.map._controls.find((control: IControl) => control instanceof RadiusControl);

    if (!existedRadiusControl) {
      const radiusControl: RadiusControl = new RadiusControl(this.resolver, this);
      this.map.addControl(radiusControl, 'top-right');
    }
  }

  /**
   * Добавление контрола для избранных товаров
   * @memberof MapService
   */
  public addOnlyFavoriteControl(): void {
    const existedOnlyFavoriteControl: OnlyFavoriteControl | undefined
      = <OnlyFavoriteControl | undefined>this.map._controls.find((control: IControl) =>
        control instanceof OnlyFavoriteControl);

    if (!existedOnlyFavoriteControl) {
      const onlyFavoriteControl: OnlyFavoriteControl = new OnlyFavoriteControl(this.resolver, this.filterService);
      this.map.addControl(onlyFavoriteControl, 'top-right');
    }
  }

  /**
   * Удаление контрола для радиуса
   * @memberof MapService
   */
  public removeRadiusControl(): void {
    const radiusControl: RadiusControl | undefined
      = <RadiusControl | undefined>this.map._controls.find((control: IControl) => control instanceof RadiusControl);
    if (radiusControl) {
      this.map.removeControl(radiusControl);
    }
  }

  /**
   * Удаление контрола для избранных товаров
   * @memberof MapService
   */
  public removeOnlyFavoriteControl(): void {
    const onlyFavoriteControl: OnlyFavoriteControl | undefined
      = <OnlyFavoriteControl | undefined>this.map._controls.find((control: IControl) =>
        control instanceof OnlyFavoriteControl);
    if (onlyFavoriteControl) {
      this.map.removeControl(onlyFavoriteControl);
    }
  }

  /**
   * Добавление контрола для рисования
   * @memberof MapService
   */
  public addDrawControl(): void {
    const drawControl = new MapboxDraw({
      defaultMode: 'draw_circle',
      userProperties: true,
      /* eslint-disable */
      modes: {
        ...MapboxDraw.modes,
        draw_circle  : maplibreGl.CircleMode,
        drag_circle  : maplibreGl.DragCircleMode,
        direct_select: maplibreGl.DirectMode,
        simple_select: maplibreGl.SimpleSelectMode
      },
      //Убираем все контролы, тк они не нужны
      controls: {
        point: false,
        line_string: false,
        polygon: false,
        trash: false,
        combine_features: false,
        uncombine_features: false,
      }
      /* eslint-enable */
    });

    this.map.addControl(<IControl><unknown>drawControl, 'top-right');
    drawControl.changeMode('draw_circle', { initialRadiusInKm: 0.5 });

    //Теряет контекст, поэтому напрямую передаем
    this.map.on('draw.update', this.onRadiusUpdate.bind(this));
  }

  /**
   * Удаление контрола для рисования
   * @memberof MapService
   */
  public removeDrawControl(): void {
    const drawControl: IControl | undefined
      = <IControl | undefined>this.map._controls.find((control: IControl) => control instanceof MapboxDraw);
    if (drawControl) {
      this.map.removeControl(drawControl);
      this.filterService.emitSettingRadiusQuery({
        center: null,
        distance: null
      });
    }
  }

  /**
   * Удаление всех слоев
   * @memberof MapService
   */
  public removeAllLayers(): void {
    const clusterPostfixes: string[] = [
      'cluster',
      'cluster-count',
      'uncluster',
      'uncluster-count'
    ];
    for (const clusterPostfix of clusterPostfixes) {
      const layerId: string = `${this.shopsSourceName}-${clusterPostfix}`;
      const existedLayer: CircleStyleLayer | SymbolStyleLayer
        = <CircleStyleLayer | SymbolStyleLayer>this.map.getLayer(layerId);
      if (existedLayer) {
        this.map.removeLayer(layerId);
      }
    }

    for (const clusterPostfix of clusterPostfixes) {
      const layerId: string = `${this.productsSourceName}-${clusterPostfix}`;
      const existedLayer: CircleStyleLayer | SymbolStyleLayer
        = <CircleStyleLayer | SymbolStyleLayer>this.map.getLayer(layerId);
      if (existedLayer) {
        this.map.removeLayer(layerId);
      }
    }

    this.removeRouteLayer();
  }

  /**
   * Удаление слоя с марщрутом
   * @memberof MapService
   */
  public removeRouteLayer(): void {
    const lineLayer: LineStyleLayer = <LineStyleLayer>this.map.getLayer(this.routeSourceName);

    if (lineLayer) {
      this.map.removeLayer(this.routeSourceName);
    }

    this.removeClearControl();
  }

  /**
   * Добавление маршрута на карту
   * @param {number[][]} coordinates коодинаты
   * @memberof MapService
   */
  public addRoute(coordinates: number[][]): void {
    this.addRouteSource(coordinates);
    this.addRouteLayer();
  }

  /**
   * Добавление товаров на карту
   * @param {Product[]} products товары
   * @memberof MapService
   */
  public addProducts(products: Product[]): void {
    this.addClusterSource<Product>(this.productsSourceName, products, this.mapProduct);
    this.addClusterLayers(this.productsSourceName);
  }

  /**
   * Добавление магазинов на карту
   * @param {Shop[]} shops магазины
   * @memberof MapService
   */
  public addShops(shops: Shop[]): void {
    this.addClusterSource<Shop>(this.shopsSourceName, shops, this.mapShop);
    this.addClusterLayers(this.shopsSourceName);
  }

  /**
   * Инициализация карты (привязка к контейнеру, добавление контролов)
   * @param {ElementRef<HTMLElement>} container контейнер для карты
   * @memberof MapService
   */
  public initMap(container: ElementRef<HTMLElement>): void {
    this.setMap(container);
    this.addControls();
    // Установка кликов только 1 раз
    this.setClusterLayersClicks(this.productsSourceName, this.productService);
    this.setClusterLayersClicks(this.shopsSourceName, this.shopService);
  }

  /**
   * Удаление карты
   * @memberof MapService
   */
  public removeMap(): void {
    this.map.remove();
  }
}
