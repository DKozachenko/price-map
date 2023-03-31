import { Observable, Subject } from "rxjs";

/**
 * Кастомный RxJs оператор
 * @export
 * @param {Observable<any>[]} observables потоки, на которые нужно подписаться
 * @return {*}  {Observable<any[]>} массив значений от потоков (если какой-либо потом не эмиттил значение, приходит null)
 */
export function customCombineLastest(observables: Observable<any>[]): Observable<any[]> {
  const values: any[] = new Array(observables.length).fill(null);
  const subject: Subject<any[]> = new Subject<any[]>();

  for (let i = 0; i < observables.length; ++i) {
    observables[i].subscribe((data: any) => {
      values[i] = data;
      subject.next(values);
    });
  }
  return subject;
}