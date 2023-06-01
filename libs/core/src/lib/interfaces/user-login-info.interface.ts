/**
 * Интерфейс информации для входа
 * @export
 * @interface IUserLoginInfo
 */
export interface IUserLoginInfo {
  [key: string]: string,
  /**
   * Никнейм
   * @type {string}
   * @memberof IUserLoginInfo
   */
  nickname: string,
  /**
   * Пароль
   * @type {string}
   * @memberof IUserLoginInfo
   */
  password: string
}