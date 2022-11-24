import { FilterType } from '../types';
export interface IFilter {
  [key: string]: string | FilterType | string[] | number[],
  name: string,
  type: FilterType,
  values: string[] | number[]
}