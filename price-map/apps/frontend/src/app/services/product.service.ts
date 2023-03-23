import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';
import { BaseSidebar } from '../classes';
import { IAction } from '../modules/map/models/interfaces';

@Injectable()
export class ProductService extends BaseSidebar {
  public productIdsToRoute: Set<string> = new Set<string>();
  public favoriteProductIds: Set<string> = new Set<string>();
  public productIdsToRoute$: Subject<Set<string>> = new Subject<Set<string>>();
  public addProductIdToRoute$: ReplaySubject<string> = new ReplaySubject<string>(1);
  public deleteProductIdFromRoute$: Subject<string> = new Subject<string>();
  // public productIdsToShow$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  public productAction$: Subject<IAction> = new Subject<IAction>();

  public addProductIdToRoute(id: string): void {
    this.productIdsToRoute.add(id);
    this.productIdsToRoute$.next(this.productIdsToRoute);
    this.addProductIdToRoute$.next(id);
  }

  public deleteProductIdFromRoute(id: string): void {
    this.productIdsToRoute.delete(id);
    this.productIdsToRoute$.next(this.productIdsToRoute);
    this.deleteProductIdFromRoute$.next(id);
  }
}