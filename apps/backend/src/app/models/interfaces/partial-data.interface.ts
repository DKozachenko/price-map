/**
 * Интерфейс частичных данных для ответа от сервера 
 * @export
 * @interface IPartialData
 */
export interface IPartialData {
  [key: string]: number | string,
  /**
   * Код состояния
   * @type {number}
   * @memberof IPartialData
   */
  statusCode: number,
  /**
   * Сообщение
   * @type {string}
   * @memberof IPartialData
   */
  message: string
}