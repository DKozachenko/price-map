import { NbIconConfig, NbToastrService } from '@nebular/theme';
import { Injectable } from '@angular/core';

@Injectable()
export class NotificationService {
  constructor(private readonly toastrService: NbToastrService) {}

  private showNotification(message: string, title: string, iconName: string, status: string, duration: number): void {
    const iconConfig: NbIconConfig = { icon: iconName, pack: 'eva' };
    this.toastrService.show(message, title,
      {
        status: status,
        duration: duration,
        destroyByClick: true,
        icon: iconConfig
      }
    )
  }

  public showError(message: string): void {
    this.showNotification(message, 'Ошибка', 'minus-circle-outline', 'danger', 2000);
  }

  public showSuccess(message: string): void {
    this.showNotification(message, 'Успех', 'checkmark-circle-2-outline', 'success', 2000);
  }
}