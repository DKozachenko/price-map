import { Injectable } from '@nestjs/common';
import { from, Observable, switchMap } from 'rxjs';
import * as bcrypt from 'bcrypt';

/**
 * Сервис для работы с хешированием паролей
 * @export
 * @class HashService
 */
@Injectable()
export class HashService {
  /**
   * Хеширование пароля
   * @param {string} password пароль
   * @return {*}  {Observable<string>} захешированный пароль
   * @memberof HashService
   */
  public hashPassword(password: string): Observable<string> {
    return from(bcrypt.genSalt())
      .pipe(
        switchMap((salt: string) => from(bcrypt.hash(password, salt)))
      );
  } 

  /**
   * Совпадают ли пароли
   * @param {string} password пароль
   * @param {string} dbPassword пароль из БД
   * @return {*}  {Observable<boolean>}
   * @memberof HashService
   */
  public isMatchPasswords(password: string, dbPassword: string): Observable<boolean> {
    return from(bcrypt.compare(password, dbPassword));
  }
}
