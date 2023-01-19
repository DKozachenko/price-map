/**
 * Интерфейс дня
 * @export
 * @interface IDay
 */
export interface IDay {
  [key: string]: string,
  /**
   * Начало рабочего дня (формат HH:MM)
   * @type {string}
   * @memberof IDay
   */
  start: string,
  /**
   * Конец рабочего дня (формат HH:MM)
   * @type {string}
   * @memberof string
   */
  end: string
}