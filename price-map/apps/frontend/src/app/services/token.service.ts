import { Injectable } from '@angular/core';
import { TokenKey } from './../models/constants';

//TODO: перейти на хранение в куки
/**
 * Сервис работы с токеном (хранит его в localStorage)
 * @export
 * @class TokenService
 */
@Injectable()
export class TokenService {
  /**
   * Установка токен
   * @param {string} token токен
   * @memberof TokenService
   */
  public setToken(token: string): void {
    localStorage.setItem(TokenKey, token);
  }

  /**
   * Получение токена
   * @return {*} {string} токен
   * @memberof TokenService
   */
  public getToken(): string {
    return localStorage.getItem(TokenKey) ?? '';
  }

  /**
   * Удаление токена
   * @memberof TokenService
   */
  public deleteToken(): void {
    localStorage.removeItem(TokenKey);
  }

  /**
   * Есть ли токен
   * @return {*}  {boolean} true / false
   * @memberof TokenService
   */
  public hasToken(): boolean {
    return !!this.getToken();
  } 
}
