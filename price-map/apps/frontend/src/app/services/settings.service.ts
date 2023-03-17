import { Injectable } from '@angular/core';
import { User } from '@core/entities';
import { Subject } from 'rxjs';

/**
 * Сервис настроек
 * @export
 * @class SettingsService
 */
@Injectable()
export class SettingsService {
  public currentUser: User;

  /**
   * Обновление пользователя
   * @type {Subject<void>}
   * @memberof SettingsService
   */
  public updateUser$: Subject<void> = new Subject<void>();
}