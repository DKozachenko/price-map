import { Injectable } from '@angular/core';
import { TokenKey } from './../models/constants';
import jwtDecode from 'jwt-decode';
import { IPayload } from '@core/interfaces';
import { CookieService } from 'ngx-cookie-service';

/**
 * Сервис работы с токеном (хранит его в Cookie)
 * @export
 * @class TokenService
 */
@Injectable()
export class TokenService {
  constructor(private readonly cookieService: CookieService) {}

  /**
   * Установка токена
   * @param {string} token токен
   * @memberof TokenService
   */
  public setToken(token: string): void {
    this.cookieService.set(TokenKey, token);
  }

  /**
   * Получение токена
   * @return {*} {string} токен
   * @memberof TokenService
   */
  public getToken(): string {
    return this.cookieService.get(TokenKey) ?? '';
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
   * Проверка токена на протухание
   * @return {*} {boolean} true / false
   * @memberof TokenService
   */
  public isExpires(): boolean {
    const payload: IPayload = this.getPayload();
    return +new Date() > payload.exp * 1000; 
  }

  /**
   * Удаление токена
   * @memberof TokenService
   */
  public deleteToken(): void {
    this.cookieService.delete(TokenKey);
  }

  /**
   * Есть ли токен
   * @return {*}  {boolean}
   * @memberof TokenService
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }
}
