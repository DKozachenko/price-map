/**
 * События магазинов
 * @export
 * @enum {string}
 */
export enum ShopEvents {
  GetShopsAttempt = 'get shops attempt',
  GetShopsFailed = 'get shops failed',
  GetShopsSuccessed = 'get shops successed',
  GetShopAttempt = 'get shop attempt',
  GetShopFailed = 'get shop failed',
  GetShopSuccessed = 'get shop successed',
  GetShopsByIdsAttempt = 'get shops by ids attempt',
  GetShopsByIdsFailed = 'get shops by ids failed',
  GetShopsByIdsSuccessed = 'get shops by ids successed',
  GetBuildgingInfoAttempt = 'get buildging info attempt',
  GetBuildgingInfoFailed = 'get buildging info failed',
  GetBuildgingInfoSuccessed = 'get buildging info successed',
}