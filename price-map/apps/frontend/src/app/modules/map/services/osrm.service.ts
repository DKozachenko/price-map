import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { Point } from 'geojson';
import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class OsrmService {
  constructor(private http: HttpClient) { }

  public createQuery(coordinates: { lat: number, lon: number }[]): string {
    let result = '';
    for (let i = 0; i < coordinates.length; ++i) {
      if (i === coordinates.length - 1) {
        result += `${coordinates[i].lat},${coordinates[i].lon}`;
      } else {
        result += `${coordinates[i].lat},${coordinates[i].lon};`;
      }
    }

    return result;
  }

  public buildRoute(coordinates: { lat: number, lon: number }[]): Observable<any> {
    const query: string = 'http://router.project-osrm.org/route/v1/driving/'
      + `${this.createQuery(coordinates)}?geometries=geojson&overview=full`;
    console.log(query);
    return this.http.get(query);
  }

}