export interface IResponseData<T = any> {
  statusCode: number,
  error: boolean,
  data: T | null,
  message: string
}
