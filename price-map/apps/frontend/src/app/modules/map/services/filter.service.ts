import { ElementRef, Injectable } from '@angular/core';
import { Point } from 'geojson';
import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class FilterService {
  public chechedCategories3Level$: Subject<Set<string>> = new Subject();
  public filterValues$: Subject<{ name: string, value: any }[]> = new Subject();

  // public getCategory3Level(id: string): any {
  //   return {
  //     id: '41c619e6-9f1f-44a5-a9ef-4d3d50cee437',
  //     name: 'cat 3 test 5',
  //     filters: [
  //       {
  //         name: 'something bool',
  //         type: 'boolean',
  //         value: undefined
  //       },
  //       {
  //         name: 'something 2 bool',
  //         type: 'boolean',
  //         value: undefined
  //       },
  //       {
  //         name: 'something enum',
  //         type: 'enum',
  //         values: [
  //           1,
  //           2,
  //           3
  //         ]
  //       },
  //       {
  //         name: 'something enum',
  //         type: 'enum',
  //         values: [
  //           'val 1',
  //           'val 2',
  //           'val 3',
  //           'val 4'
  //         ]
  //       },
  //       {
  //         name: 'something range',
  //         type: 'range',
  //         values: [
  //           5, 20
  //         ]
  //       },
  //       {
  //         name: 'something 2 range',
  //         type: 'range',
  //         values: [
  //           1, 200
  //         ]
  //       }
  //     ]
  //   };
  //};

}