import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@core/entities';
import { TokenService } from '../../../../services';

/**
 * Компонент меню для навигации
 * @export
 * @class MenuComponent
 */
@Component({
  selector: 'main-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  /**
   * Текущий пользователь
   * @type {(User | null)}
   * @memberof MenuComponent
   */
  @Input() public currentUser: User | null = null;
  
  /**
   * Активна ли кнопка меню
   * @type {boolean}
   * @memberof MenuComponent
   */
  public isMenuBtnActive: boolean = false;
  
  /**
   * Активно ли меню
   * @type {boolean}
   * @memberof MenuComponent
   */
  public isMenuActive: boolean = false;

  constructor (private readonly tokenService: TokenService,
    private router: Router) {}

  /** 
   * Смена состояния меню (свернуто / развернуто)
   * @param {Event} event событие
   * @memberof MenuComponent
   */
  public toggleMenuState(event: Event): void {
    event.preventDefault();
    this.isMenuBtnActive = !this.isMenuBtnActive;
    this.isMenuActive = !this.isMenuActive;
  }

  /**
   * Выход
   * @param {Event} event событие
   * @memberof MenuComponent
   */
  public logout(event: Event): void {
    event.preventDefault();
    this.tokenService.deleteToken();
    this.router.navigate(['auth'], { queryParamsHandling: 'merge' });
  }

  /**
   * Переход на какую-либо страницу
   * @param {string} link роут
   * @memberof MenuComponent
   */
  public goTo(link: string): void {
    this.isMenuActive = false;
    this.isMenuBtnActive = false;
    this.router.navigate([link], { queryParamsHandling: 'merge' });
  }

}
