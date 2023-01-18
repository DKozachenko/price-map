/**
 * Интерфейс характеристики
 * @export
 * @interface ICharacteristic
 */
export interface ICharacteristic {  
  [key: string]: string  | number,
  /**
   * Название
   * @type {string}
   * @memberof ICharacteristic
   */
  name: string,
  /**
   * Значение
   * @type {(string | number)}
   * @memberof ICharacteristic
   */
  value: string | number
}