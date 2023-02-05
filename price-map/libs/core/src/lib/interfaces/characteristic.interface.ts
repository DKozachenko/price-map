/**
 * Интерфейс характеристики
 * @export
 * @interface ICharacteristic
 */
export interface ICharacteristic {
  [key: string]: string  | number | boolean,
  /**
   * Название
   * @type {string}
   * @memberof ICharacteristic
   */
  name: string,
  /**
   * Значение
   * @type {(string | number | boolean)}
   * @memberof ICharacteristic
   */
  value: string | number | boolean
}
