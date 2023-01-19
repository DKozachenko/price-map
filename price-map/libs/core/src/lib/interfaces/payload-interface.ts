/**
 * Интерфейс данных, хранящихся в токене
 * @export
 * @interface IPayload
 */
export interface IPayload {
  [key: string]: number | string,
  /**
   * Время (timestamp), когда токен станет невалидным
   * @type {number}
   * @memberof IPayload
   */
  exp: number,
  /**
   * Время (timestamp), когда токен был создан
   * @type {number}
   * @memberof IPayload
   */
  iat: number,
  /**
   * Никнейм пользователя
   * @type {string}
   * @memberof IPayload
   */
  nickname: string,
  /**
   * Роль пользователя
   * @type {string}
   * @memberof IPayload
   */
  role: string,
  /**
   * Id пользователя
   * @type {string}
   * @memberof IPayload
   */
  userId: string
}