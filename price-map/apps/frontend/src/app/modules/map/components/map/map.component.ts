import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { Point } from 'geojson';
import { Map, NavigationControl, Popup } from 'maplibre-gl';
import { WebSocketService } from '../../../../services';
import { MapService } from '../../services';

@Component({
  selector: 'price-map-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy, OnInit {
  public categories1Level: any[] = [
    {
      name: 'cat 1 test 1',
      categories2Level: [{
        name: 'cat 2 test 1',
        categories3Level: [
          {
            name: 'cat 3 test 1',
            filters: []
          },
          {
            name: 'cat 3 test 2',
            filters: []
          },
          {
            name: 'cat 3 test 3',
            filters: []
          }
        ],
        showCategories3Level: false
      }],
      showCategories2Level: false
    },
    {
      name: 'cat 1 test 2',
      categories2Level: [
        {
          name: 'cat 2 test 2',
          categories3Level: [
            {
              name: 'cat 3 test 4',
              filters: []
            },
          ],
          showCategories3Level: false
        },
        {
          name: 'cat 2 test 3',
          categories3Level: [
            {
              name: 'cat 3 test 5',
              filters: []
            },
            {
              name: 'cat 3 test 5',
              filters: []
            },
          ],
          showCategories3Level: false
        },
        {
          name: 'cat 2 test 4',
          categories3Level: [],
          showCategories3Level: false
        }
      ],
      showCategories2Level: false
    },
  ]

  public showCategories2Level(category1Level: any): void {
    category1Level.showCategories2Level = !category1Level.showCategories2Level;
  }

  public showCategories3Level(category2Level: any): void {
    category2Level.showCategories3Level = !category2Level.showCategories3Level;
  }

  public select3LevelCategory(cat: any, e: Event): void {
    console.log('e', e)
    console.log(cat, (e.target as HTMLInputElement).checked)
  }

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly mapService: MapService) {}

  ngAfterViewInit() {
    this.mapService.initMap(this.mapContainer);
    this.mapService.loadSource();
    this.mapService.addControl();
    this.mapService.setClicks();
  }

  ngOnInit(): void {
    console.log('map component');

    this.webSocketSevice.socket.on('get users failed', (response) => {
      console.log('on get users failed', response);
      alert('Глаза разуй, дебил, данные чекни');
    });

    this.webSocketSevice.socket.on('get users successed', (response) => {
      console.log('on get users successed', response);
    });

    this.webSocketSevice.addToken();
    this.webSocketSevice.socket.emit('get users attempt', { temp: 1 });

    this.mapService.clicks$?.subscribe((data) => console.log('clicks', data))
  }

  ngOnDestroy() {
    this.mapService.removeMap();
  }
}
