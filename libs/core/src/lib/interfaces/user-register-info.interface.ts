import { IUserLoginInfo } from '.';

/**
 * Интерфейс информации для регистрации
 * @export
 * @interface IUserRegisterInfo
 */
export interface IUserRegisterInfo extends IUserLoginInfo {
  [key: string]: string,
  /**
   * Имя
   * @type {string}
   * @memberof IUserRegisterInfo
   */
  name: string,
  /**
   * Фамилия
   * @type {string}
   * @memberof IUserRegisterInfo
   */
  lastName: string,
  /**
   * Почта
   * @type {string}
   * @memberof IUserRegisterInfo
   */
  mail: string
}