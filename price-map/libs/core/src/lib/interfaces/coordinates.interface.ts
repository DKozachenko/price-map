/**
 * Интерфейс координат
 * @export
 * @interface ICoordinates
 */
export interface ICoordinates {
  [key: string]: number,
  /**
   * Широта
   * @type {number}
   * @memberof ICoordinates
   */
  latitude: number,
  /**
   * Долгота
   * @type {number}
   * @memberof ICoordinates
   */
  longitude: number
}