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
  GetFavoriteProductsAttempt = 'get favorite products attempt',
  GetFavoriteProductsFailed = 'get favorite products failed',
  GetFavoriteProductsSuccessed = 'get favorite products successed',
  UpdateFavoriteProductsAttempt = 'update favorite products attempt',
  UpdateFavoriteProductsFailed = 'update favorite products failed',
  UpdateFavoriteProductsSuccessed = 'update favorite products successed',
  GetUsersAttempt = 'get users attempt',
  GetUsersFailed = 'get users failed',
  GetUsersSuccessed = 'get users successed',
  DeleteUserAttempt = 'delete user attempt',
  DeleteUserFailed = 'delete user failed',
  DeleteUserSuccessed = 'delete user successed',
}