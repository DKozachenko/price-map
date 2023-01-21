import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { Repository } from 'typeorm';
import { ICoordinates } from '@core/interfaces';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  private createQuery(coordinates: ICoordinates[]): string {
    let result = '';
    for (let i = 0; i < coordinates.length; ++i) {
      if (i === coordinates.length - 1) {
        result += `${coordinates[i].latitude},${coordinates[i].longitude}`;
      } else {
        result += `${coordinates[i].latitude},${coordinates[i].longitude};`;
      }
    }

    return result;
  }

  public buildRoute(coordinates: ICoordinates[]): Observable<any> {
    const query: string = 'http://router.project-osrm.org/route/v1/driving/'
      + `${this.createQuery(coordinates)}?overview=full`;
    Logger.debug(query);
    return this.httpService.get<any>(query);
  }
}