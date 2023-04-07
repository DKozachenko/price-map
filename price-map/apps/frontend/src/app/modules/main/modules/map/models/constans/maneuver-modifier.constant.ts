/**
 * Словарь соответствия модификатора маневра и его перевода
 * @export
 * @type { Map<string, string> }
 */
export const maneuverModifier: Map<string, string> = new Map<string, string>([
  ['uturn', 'разворот'],
  ['sharp right', 'резко направо'],
  ['right', 'направо'],
  ['slight right', 'плавно направо'],
  ['straight', 'прямо'],
  ['slight left', 'плавно налево'],
  ['left', 'налево'],
  ['sharp left', 'резко налево'],
]);