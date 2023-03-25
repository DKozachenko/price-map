import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { IPayload, IResponseData } from '@core/interfaces';
import { SettingsService, TokenService, WebSocketService } from '../../../../services';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { delay } from 'rxjs';

/**
 * Компонент шапки
 * @export
 * @class HeaderComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'shared-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  /**
   * Id текущего пользователя
   * @private
   * @type {string}
   * @memberof HeaderComponent
   */
  private userId: string = '';
  /**
   * Текущий пользователь
   * @type {(User | null)}
   * @memberof HeaderComponent
   */
  public currentUser: User | null = null;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly tokenService: TokenService,
    private readonly router: Router,
    private readonly settingsService: SettingsService) {}

  public ngOnInit(): void {
    const payload: IPayload = this.tokenService.getPayload();
    this.userId = payload.userId;

    this.webSocketService.on<IResponseData<User>>(UserEvents.GetUserSuccessed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<User>) => {
        this.currentUser = response.data;
        this.settingsService.setUser(response.data)
      });

    this.webSocketService.emit<string>(UserEvents.GetUserAttempt, this.userId);
    this.settingsService.updateUser$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(() => this.webSocketService.emit<string>(UserEvents.GetUserAttempt, this.userId));
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
