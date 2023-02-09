import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Сервис настроек
 * @export
 * @class SettingsService
 */
@Injectable()
export class SettingsService {
  /**
   * Обновление пользователя
   * @type {Subject<void>}
   * @memberof SettingsService
   */
  public updateUser$: Subject<void> = new Subject<void>();
}