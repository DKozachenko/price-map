import { ReplaySubject } from "rxjs";

export class BaseSidebar {
  public itemIdsToShow$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
}