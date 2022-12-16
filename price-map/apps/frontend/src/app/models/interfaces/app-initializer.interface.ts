import { Observable } from "rxjs";

export interface IAppInitializer {
  (): () => Observable<number>;
}