import { ElementRef, Injectable } from '@angular/core';
import { Point } from 'geojson';
import { Map, Marker, NavigationControl, Popup, Source } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MapService {
  public clicks$: Subject<Point> = new Subject();
  public productIdsToRoute: Set<string> = new Set();
  public productIdsToRoute$: Subject<Set<string>> = new Subject();
  public map!: Map;

  public initMap(container: ElementRef<HTMLElement>): void {
    const initialState = { lng: 82.936, lat: 55.008, zoom: 12 };
    // const initialState = { lng: -77.038, lat: 38.931, zoom: 14 };

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


  public addLayer(): void {
    const productsLayer = this.map?.getLayer('products');

    if (productsLayer) {
      productsLayer.source = 'products';
    } else {
      this.map?.addLayer({
        id: 'products',
        type: 'symbol',
        source: 'products',
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
    const features = products.map((item: any) => {
      // console.log(item, item.shop.coordinates.longitude, item.shop.coordinates.latitude)
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
      });
    }


    this.addLayer();
  }

  public createPopupDomContent(productInfo: any): HTMLDivElement {
    const div = document.createElement('div');
    const p = document.createElement('p');
    p.classList.add('product__popup-title');
    p.textContent = productInfo.name;
    div.append(p);
    const p2 = document.createElement('p');
    p2.classList.add('product__popup-description');
    p2.textContent = productInfo.description;
    div.append(p2);
    const button = document.createElement('button');
    button.classList.add('product__popup-button');
    button.textContent = 'Добавить в маршрут';
    button.addEventListener('click', () => this.addProductIdToRoute(productInfo.id));
    div.append(button);
    return div;
  }

  public addProductIdToRoute(id: string): void {
    const idInRoute: string | undefined = [...this.productIdsToRoute].find((productId: string) => productId === id);
    this.productIdsToRoute.add(id);
    if (!idInRoute) {
      this.productIdsToRoute$.next(this.productIdsToRoute);
    }
  }


  public addControl(): void {
    this.map.addControl(new NavigationControl({}), 'top-right');
    // new Marker({ color: '#FF0000' }).setLngLat([-77.003168, 38.894651]).addTo(this.map);
  }

  public setClicks(): void {
    this.map.on('click', (e: any) => {
      console.log(e);
    });


    this.map.on('click', 'products', (e: any) => {
      const geometry = e?.features?.[0]?.geometry as unknown as Point;
      this.clicks$.next(geometry);
      const coordinates = <[number, number]>geometry?.coordinates?.slice();
      const description = e?.features?.[0]?.properties?.['description'];
      const name = e?.features?.[0]?.properties?.['name'];
      const id = e?.features?.[0]?.properties?.['id'];

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

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
