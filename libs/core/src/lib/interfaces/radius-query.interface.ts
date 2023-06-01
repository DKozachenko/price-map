import { ICoordinates } from "./coordinates.interface"

/**
 * Запрос для радиуса
 * @export
 * @interface IRadiusQuery
 */
export interface IRadiusQuery {
  [key: string]: ICoordinates | number | null,
  /**
   * Центр
   * @type {(ICoordinates | null)}
   * @memberof IRadiusQuery
   */
  center: ICoordinates | null
  /**
   * Расстояние (м)
   * @type {(number | null)}
   * @memberof IRadiusQuery
   */
  distance: number | null
}
