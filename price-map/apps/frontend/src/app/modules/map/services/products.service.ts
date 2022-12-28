import { ElementRef, Injectable } from '@angular/core';
import { Point } from 'geojson';
import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ProductsService {
  public products: any[] = [
    {
      id: '4accfa62-e0e6-4a68-b176-6905226568ca',
      name: 'product name',
      description: 'product desc',
      price: 1500,
      category3Level: {
        id: 'c5096616-92c9-4d1b-86ca-baf297d39961',
        name: 'cat 3 test 1',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.038659,
          longitude: 38.931567
        }
      }
    },
    {
      id: '27add868-710b-45c3-aa8d-0434ddfe3fac',
      name: 'product name 2',
      description: 'product desc 2',
      price: 1300,
      category3Level: {
        id: 'c5096616-92c9-4d1b-86ca-baf297d39961',
        name: 'cat 3 test 1',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.003168,
          longitude: 38.894651
        }
      }
    },
    {
      id: '8a7594ce-3ac3-4519-a3d5-1e6134b9ac4a',
      name: 'product name 3',
      description: 'product desc 3',
      price: 1000,
      category3Level: {
        id: '86eac329-e8ae-404a-82b5-16a196c1dd87',
        name: 'cat 3 test 2',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.090372,
          longitude: 38.881189
        }
      }
    },
    {
      id: 'cc073abf-1387-4035-b1ba-d469038d4321',
      name: 'product name 4',
      description: 'product desc 4',
      price: 10000,
      category3Level: {
        id: '86eac329-e8ae-404a-82b5-16a196c1dd87',
        name: 'cat 3 test 2',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.111561,
          longitude: 38.882342
        }
      }
    },
    {
      id: '0913d171-6ffd-4e4e-bb69-c3406aeace39',
      name: 'product name 5',
      description: 'product desc 5',
      price: 12000,
      category3Level: {
        id: '86eac329-e8ae-404a-82b5-16a196c1dd87',
        name: 'cat 3 test 2',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.052477,
          longitude: 38.943951
        }
      }
    },
    {
      id: '7c93d34b-ab7b-40dd-8696-09ee4590f51f',
      name: 'product name 6',
      description: 'product desc 6',
      price: 5000,
      category3Level: {
        id: '7dcd2410-3412-4f7b-bbb8-4831e422d697',
        name: 'cat 3 test 3',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.111561,
          longitude: 38.882342
        }
      }
    },
    {
      id: '1452ae64-db55-4871-9265-5cc209fd3590',
      name: 'product name 7',
      description: 'product desc 7',
      price: 7000,
      category3Level: {
        id: '7dcd2410-3412-4f7b-bbb8-4831e422d697',
        name: 'cat 3 test 3',
        filters: []
      },
      shop: {
        coordinates: {
          latitude: -77.052477,
          longitude: 38.943951
        }
      }
    },
  ]

}