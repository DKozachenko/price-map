import { IDay } from '.';

export interface ISchedule {
  [key: string]: IDay | undefined,
  monday?: IDay,
  tuesday?: IDay,
  wednesday?: IDay,
  thursday?: IDay,
  friday?: IDay,
  saturday?: IDay,
  sunday?: IDay
}