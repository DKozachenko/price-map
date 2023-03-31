import { SettingsService, TokenService, WebSocketService } from './../../../../../../services';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';

/**
 * Компонент пользователя
 * @export
 * @class UserComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'admin-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  /**
   * Пользователь
   * @type {(User | null)}
   * @memberof UserComponent
   */
  @Input() public user: User | null = null;

  /**
   * Текущий пользователь
   * @type {boolean}
   * @memberof UserComponent
   */
  public isCurrentUser: boolean = false;

  constructor(private readonly settingsService: SettingsService,
    private readonly webSocketService: WebSocketService,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    // Если в settingsService еще нет пользователя, сравнение идет по id пользователя из токена
    this.isCurrentUser = (this.settingsService.getUser()?.id ?? this.tokenService.getPayload().userId) === this.user?.id;
  }

  /**
   * Удаление
   * @memberof UserComponent
   */
  public remove(): void {
    this.webSocketService.emit<string>(UserEvents.DeleteUserAttempt, this.user?.id ?? '');
  }
}
