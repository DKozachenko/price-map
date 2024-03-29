import { DbErrorCode } from '.';

/**
 * Коды ошибок авторизации
 * @export
 * @type {string}
 */
export type AuthErrorCode = 'EXISTED_NICKNAME' | 'EXISTED_MAIL' | 'HASH_ERROR' | 'NON_EXISTENT_LOGIN' | 'WRONG_PASSWORD' | DbErrorCode;