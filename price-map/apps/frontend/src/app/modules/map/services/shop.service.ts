import { Injectable } from '@angular/core';
import { ReplaySubject} from 'rxjs';

@Injectable()
export class ShopService {
  public shopIdsToShow$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  // public productAction$: Subject<IAction> = new Subject<IAction>();

}