export interface IResponseCallback<T> {
  (response: T): void;
}
