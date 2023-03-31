/**
 * Интерфейс контрола на карте
 * @export
 * @interface IMapControl
 */
export interface IMapControl {
  /**
   * Функция создания DOM контента для контрола
   * @return {*}  {HTMLDivElement} элемент
   * @memberof IMapControl
   */
  createControlDomContent(): HTMLDivElement;
} 