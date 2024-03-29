/* eslint-disable array-bracket-newline */
/**
 * Словарь соответствия типа маневра и его перевода
 * @export
 * @type { Map<string, string> }
 */
export const maneuverType: Map<string, string> = new Map<string, string>([
  ['turn', 'Поворот'],
  ['new name', 'Дорога изменилась'],
  ['depart', 'Начало участка'],
  ['arrive', 'Конец участка'],
  ['merge', 'Слияние с улицей'],
  ['on ramp', 'Пандус для въезда на шоссе'],
  ['off ramp', 'Пандрус для съезда с шоссе'],
  ['fork', 'Поворот на развилке'],
  ['end of road', 'Дорога заканчивается Т-образным перекрестком'],
  ['use lane', 'Движение прямо по полосе'],
  ['continue', 'Поворот'],
  ['roundabout', 'Пересечение с кольцевой развязкой'],
  ['rotary', 'Кольцевая транспортная развязка'],
  ['roundabout turn', 'Поворот на кольцевой развязке'],
  ['notification', 'Изменение условий движения']
]);