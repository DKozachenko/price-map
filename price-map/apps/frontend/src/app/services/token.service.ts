import { Injectable } from '@angular/core';
import { TokenKey } from './../models/constants';
import jwtDecode from 'jwt-decode';
import { IPayload } from '@core/interfaces';

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
   * Получение данных из токена
   * @return {*}  {IPayload} данные
   * @memberof TokenService
   */
  public getPayload(): IPayload {
    const token: string = this.getToken();
    const tokenWithoutBearer: string = token.split(' ')?.[1];
    const payload: IPayload = jwtDecode(tokenWithoutBearer);
    return payload;
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
