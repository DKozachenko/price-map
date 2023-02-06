/**
 * Интерфейс пользовательского фильтра (определенной категории 3 уровня)
 * @export
 * @interface IUserFilter
 */
export interface IUserFilter {
  [key: string]: string | string[] | number[] | boolean | null
  /**
   * Название фильтра
   * @type {string}
   * @memberof IUserFilter
   */
  name: string,
  /**
   * Значение 
   * @type {(string | number | string[] | number[] | boolean)}
   * @memberof IUserFilter
   */
  value: string[] | number[] | boolean | null
}