import { ElementRef, Injectable } from '@angular/core';
import { IUserFilter } from '@core/interfaces';
import { Point } from 'geojson';
import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { Observable, Subject, ReplaySubject } from 'rxjs';

@Injectable()
export class FilterService {
  public chechedCategories3Level$: ReplaySubject<Set<string>> = new ReplaySubject(1);
  public filterValues$: Subject<IUserFilter[]> = new Subject();
}