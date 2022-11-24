import { IDay } from '.';

export interface ISchedule {
  monday?: IDay,
  tuesday?: IDay,
  wednesday?: IDay,
  thursday?: IDay,
  friday?: IDay,
  saturday?: IDay,
  sunday?: IDay
}