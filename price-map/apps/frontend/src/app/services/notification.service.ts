import { NbIconConfig, NbToastrService } from '@nebular/theme';
import { Injectable } from '@angular/core';
import { NbComponentStatus } from '@nebular/theme';

/**
 * Сервис оповещений
 * @export
 * @class NotificationService
 */
@Injectable()
export class NotificationService {
  constructor(private readonly toastrService: NbToastrService) {}

  /**
   * Отображение оповещения
   * @private
   * @param {string} message сообщение
   * @param {string} title заголовок
   * @param {string} iconName название иконки в паке
   * @param {NbComponentStatus} status статус
   * @param {number} duration задержка
   * @memberof NotificationService
   */
  private showNotification(
    message: string, 
    title: string, 
    iconName: string, 
    status: NbComponentStatus, 
    duration: number
  ): void {
    const iconConfig: NbIconConfig = { icon: iconName, pack: 'eva' };
    this.toastrService.show(message, title, {
      status,
      duration,
      destroyByClick: true,
      icon: iconConfig
    });
  }

  /**
   * Отображние оповещения об ошибке
   * @param {string} message сообщение
   * @memberof NotificationService
   */
  public showError(message: string): void {
    this.showNotification(message, 'Ошибка', 'minus-circle-outline', 'danger', 2000);
  }

  /**
   * Отображение оповещения об успехе
   * @param {string} message сообщение
   * @memberof NotificationService
   */
  public showSuccess(message: string): void {
    this.showNotification(message, 'Успех', 'checkmark-circle-2-outline', 'success', 2000);
  }
}