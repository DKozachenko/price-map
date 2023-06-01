/**
 * Настрока таба
 * @export
 * @interface ITabSetting
 */
export interface ITabSetting {
  [key: string]: string | boolean,
  /**
   * Идентификатор таба
   * @type {string}
   * @memberof ITabSetting
   */
  tabId: string,
  /**
   * Заголовок
   * @type {string}
   * @memberof ITabSetting
   */
  title: string,
  /**
   * Активность
   * @type {boolean}
   * @memberof ITabSetting
   */
  active: boolean
}