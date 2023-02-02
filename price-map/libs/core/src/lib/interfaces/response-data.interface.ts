/**
 * Интерфейс ответа от сервера
 * @export
 * @interface IResponseData
 * @template T тип данных ответа
 * @template K тип кода ошибки
 */
export interface IResponseData<T = any, K = any> {
  [key: string]: number | boolean | T | null | string | any,
  /**
   * Код состояния
   * @type {number}
   * @memberof IResponseData
   */
  statusCode: number,
  /**
   * Код ошибки
   * @type {K}
   * @memberof IResponseData
   */
  errorCode: K,
  /**
   * Есть ошибка
   * @type {boolean}
   * @memberof IResponseData
   */
  isError: boolean,
  /**
   *
   * Данные
   * @type {T}
   * @memberof IResponseData
   */
  data: T,
  /**
   * Сообщение
   * @type {string}
   * @memberof IResponseData
   */
  message: string
}
