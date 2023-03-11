/**
 * Интерфейс запроса для цены
 * @export
 * @interface IPriceQuery
 */
export interface IPriceQuery {
  /**
   * Максимальное значение
   * @type {(number | null)}
   * @memberof IPriceQuery
   */
  max: number | null,
  /**
   * Минимальное значение
   * @type {(number | null)}
   * @memberof IPriceQuery
   */
  min: number | null
}
