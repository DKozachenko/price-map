/**
 * События пользователей
 * @export
 * @enum {string}
 */
export enum UserEvents {
  GetUserAttempt = 'get user attempt',
  GetUserFailed = 'get user failed',
  GetUserSuccessed = 'get user successed',
  UpdateUserAttempt = 'update user attempt',
  UpdateUserFailed = 'update user failed',
  UpdateUserSuccessed = 'update user successed',
  UpdateFavoriteProductsAttempt = 'update favorite products attempt',
  UpdateFavoriteProductsFailed = 'update favorite products failed',
  UpdateFavoriteProductsSuccessed = 'update favorite products successed',
  GetUsersAttempt = 'get users attempt',
  GetUsersFailed = 'get users failed',
  GetUsersSuccessed = 'get users successed',
}