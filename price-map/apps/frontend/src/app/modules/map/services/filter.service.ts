import { ElementRef, Injectable } from '@angular/core';
import { Point } from 'geojson';
import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class FilterService {
  public chechedCategories3Level$: Subject<Set<string>> = new Subject();
  public filterValues$: Subject<{ name: string, value: any }[]> = new Subject();

  public categories1Level: any[] = [
    {
      id: 'bc308baf-900e-44d2-adea-2e24baec9863',
      name: 'cat 1 test 1',
      categories2Level: [{
        id: '72bc9713-3863-48d4-a522-8d738d2a849b',
        name: 'cat 2 test 1',
        categories3Level: [
          {
            id: 'c5096616-92c9-4d1b-86ca-baf297d39961',
            name: 'cat 3 test 1',
            filters: []
          },
          {
            id: '86eac329-e8ae-404a-82b5-16a196c1dd87',
            name: 'cat 3 test 2',
            filters: []
          },
          {
            id: '7dcd2410-3412-4f7b-bbb8-4831e422d697',
            name: 'cat 3 test 3',
            filters: []
          }
        ],
      }],
    },
    {
      id: '43fe9122-7802-44f8-8000-6cbec4625f83',
      name: 'cat 1 test 2',
      categories2Level: [
        {
          id: 'd344ee16-13c5-481a-b5fc-e7af70213ca8',
          name: 'cat 2 test 2',
          categories3Level: [{
            id: 'ddaa8a1f-c83d-4f56-a33d-761a964f65c8',
            name: 'cat 3 test 4',
            filters: []
          }],
        },
        {
          id: '30b6a275-4d92-4923-b137-0029d87baa2f',
          name: 'cat 2 test 3',
          categories3Level: [
            {
              id: 'de65e3e8-c38c-4550-b206-e53a674d86ef',
              name: 'cat 3 test 5',
              filters: []
            },
            {
              id: '41c619e6-9f1f-44a5-a9ef-4d3d50cee437',
              name: 'cat 3 test 5',
              filters: []
            },
          ],
        },
        {
          id: 'e02fb806-29c0-4e14-bc2c-a5294b8b53ce',
          name: 'cat 2 test 4',
          categories3Level: [],
        }
      ],
    },
  ];

  public getCategory3Level(id: string): any {
    return {
      id: '41c619e6-9f1f-44a5-a9ef-4d3d50cee437',
      name: 'cat 3 test 5',
      filters: [
        {
          name: 'something bool',
          type: 'boolean',
          value: undefined
        },
        {
          name: 'something 2 bool',
          type: 'boolean',
          value: undefined
        },
        {
          name: 'something enum',
          type: 'enum',
          values: [
            1,
            2,
            3
          ]
        },
        {
          name: 'something enum',
          type: 'enum',
          values: [
            'val 1',
            'val 2',
            'val 3',
            'val 4'
          ]
        },
        {
          name: 'something range',
          type: 'range',
          values: [
            5, 20
          ]
        },
        {
          name: 'something 2 range',
          type: 'range',
          values: [
            1, 200
          ]
        }
      ]
    };
  };

}