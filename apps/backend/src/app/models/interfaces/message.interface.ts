/**
 * Интерфейс обмена сообщениями между бэком и сервисами
 * @export
 * @interface IMessage
 * @template T тип посылаемых / принимаемых данных
 */
export interface IMessage<T> {
  /**
   * Данные
   * @type {T}
   * @memberof IMessage
   */
  data: T,
  /**
   * Описание
   * @type {string}
   * @memberof IMessage
   */
  description: string,
  /**
   * Время отправки
   * @type {Date}
   * @memberof IMessage
   */
  sendTime: Date
}