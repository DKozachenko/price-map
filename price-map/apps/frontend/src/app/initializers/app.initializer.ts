import { IAppInitializer } from './../models/interfaces';
import { Observable, of } from "rxjs";

export const appInitializer: IAppInitializer = () => {
  console.log(12)
  return () => of(1);
}