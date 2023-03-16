/**
 * События товаров
 * @export
 * @enum {string}
 */
export enum ProductEvents {
  GetProductsAttempt = 'get products attempt',
  GetProductsFailed = 'get products failed',
  GetProductsSuccessed = 'get products successed',
  GetProductsByIdsAttempt = 'get products by ids attempt',
  GetProductsByIdsFailed = 'get products by ids failed',
  GetProductsByIdsSuccessed = 'get products by ids successed',
  GetProductAttempt = 'get product attempt',
  GetProductFailed = 'get product failed',
  GetProductSuccessed = 'get product successed',
  GetPriceRangeAttempt = 'get price range attempt',
  GetPriceRangeFailed = 'get price range failed',
  GetPriceRangeSuccessed = 'get price range successed',
}
