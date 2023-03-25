import { SettingsService, WebSocketService } from './../../../../services';
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
    private readonly webSocketService: WebSocketService) {}

  public ngOnInit(): void {
    this.isCurrentUser = this.settingsService.getUser().id === this.user?.id;
  }

  public remove(): void {
    this.webSocketService.emit<string>(UserEvents.DeleteUserAttempt, this.user?.id ?? '');
  }
}
