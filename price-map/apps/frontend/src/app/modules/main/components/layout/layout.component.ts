import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IPayload, IResponseData } from '@core/interfaces';
import { NotificationService, SettingsService, TokenService, WebSocketService } from '../../../../services';

/**
 * Компонент разметки
 * @export
 * @class LayoutComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'main-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  /**
   * Текущий пользователь
   * @type {User}
   * @memberof LayoutComponent
   */
  public currentUser: User;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly tokenService: TokenService,
    private readonly settingsService: SettingsService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    const payload: IPayload = this.tokenService.getPayload();

    this.webSocketService.on<IResponseData<null>>(UserEvents.GetUserFailed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<User>>(UserEvents.GetUserSuccessed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<User>) => {
        this.settingsService.setUser(response.data);
        this.currentUser = response.data;
      });

    this.webSocketService.emit<string>(UserEvents.GetUserAttempt, payload.userId);
  }

}
