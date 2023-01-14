export interface IResponseData<T> {
  statusCode: number,
  error: boolean,
  data: T | null,
  message: string
}