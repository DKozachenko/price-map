import { RouteLeg } from 'osrm';

/**
 * Интерфейс данных от OSRM, которые получает фронтенд
 * @export
 * @interface IOsrmData
 */
export interface IOsrmData {
  [key: string]: number[][] | RouteLeg[],
  /**
   * Координаты
   * @type {number[][]}
   * @memberof IOsrmData
   */
  coordinates: number[][],
  /**
   * Маршруты между ключевыми точками
   * http://project-osrm.org/docs/v5.5.1/api/#routeleg-object
   * @type {RouteLeg[]}
   * @memberof IOsrmData
   */
  legs: RouteLeg[]
}