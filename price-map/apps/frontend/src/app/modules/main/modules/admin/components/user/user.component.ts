import { SettingsService, TokenService, WebSocketService } from './../../../../../../services';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';

@Component({
  selector: 'admin-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Input() user: User | null = null;
  public isCurrentUser: boolean = false;

  constructor(private readonly settingsService: SettingsService,
    private readonly webSocketService: WebSocketService,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    // Если в settingsService еще нет пользователя, сравнение идет по id пользователя из токена
    this.isCurrentUser = (this.settingsService.getUser()?.id ?? this.tokenService.getPayload().userId) === this.user?.id;
  }

  public remove(): void {
    this.webSocketService.emit<string>(UserEvents.DeleteUserAttempt, this.user?.id ?? '');
  }
}
