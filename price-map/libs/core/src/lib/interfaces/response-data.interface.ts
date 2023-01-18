/**
 * Интерфейс ответа от сервера
 * @export
 * @interface IResponseData
 * @template T тип данных ответа
 */
export interface IResponseData<T = any> {
  [key: string]: number | boolean | T | null | string,
  /**
   * Код состояния
   * @type {number}
   * @memberof IResponseData
   */
  statusCode: number,
  /**
   * Есть ошибка
   * @type {boolean}
   * @memberof IResponseData
   */
  error: boolean,
  /**
   * Данные
   * @type {(T | null)}
   * @memberof IResponseData
   */
  data: T | null,
  /**
   * Сообщение
   * @type {string}
   * @memberof IResponseData
   */
  message: string
}
