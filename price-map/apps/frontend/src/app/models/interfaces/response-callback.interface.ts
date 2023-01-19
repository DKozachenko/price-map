/**
 * Интерфейс колбэка, срабатывающего при подписке на ответ от сервера
 * @export
 * @interface IResponseCallback
 * @template T тип данных ответа, который отправляет сервер
 */
export interface IResponseCallback<T> {
  (response: T): void;
}
