/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { User } from '@core/entities';
import { Subject, Observable } from 'rxjs';

/**
 * Сервис-стор настроек
 * @export
 * @class SettingsService
 */
@Injectable()
export class SettingsService {
  /**
   * Текущий пользователь
   * @private
   * @type {User}
   * @memberof SettingsService
   */
  private currentUser: User;

  /**
   * Получение пользователя
   * @return {*}  {User} пользователь
   * @memberof SettingsService
   */
  public getUser(): User {
    return this.currentUser;
  }

  /**
   * Установка пользователя
   * @param {User} user
   * @memberof SettingsService
   */
  public setUser(user: User): void {
    this.currentUser = user;
  }

  /**
   * Подписка на обновление пользователя
   * @private
   * @type {Subject<void>}
   * @memberof SettingsService
   */
  private updateUser: Subject<void> = new Subject<void>();

  /**
   * Подписка на обновление пользователя (публичная)
   * @type {Observable<void>}
   * @memberof SettingsService
   */
  public updateUser$: Observable<void> = this.updateUser.asObservable(); 

  /**
   * Событие изменения пользователя
   * @memberof SettingsService
   */
  public emitUpdateUser(): void {
    this.updateUser.next();
  }
}