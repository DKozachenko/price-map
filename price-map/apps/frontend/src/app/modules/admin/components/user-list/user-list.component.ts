import { Component, OnInit } from '@angular/core';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService, WebSocketService } from '../../../../services';

@UntilDestroy()
@Component({
  selector: 'price-map-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  public users: User[] = [];

  constructor(private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(UserEvents.GetUsersFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));

    this.webSocketService.on<IResponseData<User[]>>(UserEvents.GetUsersSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User[]>) => {
        this.users = response.data;
        console.log(this.users)
      });

    this.webSocketService.emit<null>(UserEvents.GetUsersAttempt, null);
  }

  public trackByUser(index: number, item: User): string {
    return item.id ?? index;
  }
} 
