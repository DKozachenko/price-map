import { IDay } from '.';

/**
 * Интерфейс расписания
 * @export
 * @interface ISchedule
 */
export interface ISchedule {
  [key: string]: IDay | undefined,
  /**
   * Понедельник
   * @type {IDay}
   * @memberof ISchedule
   */
  monday?: IDay,
  /**
   * Вторник
   * @type {IDay}
   * @memberof ISchedule
   */
  tuesday?: IDay,
  /**
   * Среда
   * @type {IDay}
   * @memberof ISchedule
   */
  wednesday?: IDay,
  /**
   * Четверг
   * @type {IDay}
   * @memberof ISchedule
   */
  thursday?: IDay,
  /**
   * Пятница
   * @type {IDay}
   * @memberof ISchedule
   */
  friday?: IDay,
  /**
   * Суббота
   * @type {IDay}
   * @memberof ISchedule
   */
  saturday?: IDay,
  /**
   * Воскресенье
   * @type {IDay}
   * @memberof ISchedule
   */
  sunday?: IDay
}