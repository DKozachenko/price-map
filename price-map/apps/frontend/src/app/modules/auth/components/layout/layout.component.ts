import { Component } from '@angular/core';
import { ITabSetting } from '../../models/interfaces';

/**
 * Компонент разметки
 * @export
 * @class LayoutComponent
 */
@Component({
  selector: 'auth-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  public isLoading: boolean = false;

  /**
   * Изначальные настройки табов
   * @type {ITabSetting[]}
   * @memberof LayoutComponent
   */
  public tabsSettings: ITabSetting[] = [
    {
      tabId: 'login',
      title: 'Вход',
      active: true
    },
    {
      tabId: 'register',
      title: 'Регистрация',
      active: false
    }
  ];

  /**
   * Смена активного таба на таб "Вход"
   * @memberof LayoutComponent
   */
  public setLoginTabActive(): void {
    //Костыль, чтобы после регистрации переводить на вкладку "Входа";
    //Тк в UI библиотеке не предусмотрена програмная смена вкладки;
    //Замена на отдельную переменную ломает
    //Не дышать и не трогать
    this.tabsSettings = [
      {
        tabId: 'login',
        title: 'Вход',
        active: true
      },
      {
        tabId: 'register',
        title: 'Регистрация',
        active: false
      }
    ];
  }

  public setLoading(state: boolean) {
    this.isLoading = state;
  }
}
