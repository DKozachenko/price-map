import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IPayload } from '@core/interfaces';
import { TokenService } from '../../../../services';

/**
 * Компонент шапки
 * @export
 * @class HeaderComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  /**
   * Данные из токена
   * @type {IPayload}
   * @memberof HeaderComponent
   */
  public payload: IPayload;

  constructor(private readonly tokenService: TokenService,
    private readonly router: Router) {}

  public ngOnInit(): void {
    this.payload = this.tokenService.getPayload();
  }

  /**
   * Выход
   * @memberof HeaderComponent
   */
  public logout(): void {
    this.tokenService.deleteToken();
    this.router.navigate(['auth'], { queryParamsHandling: 'merge' });
  }
}
