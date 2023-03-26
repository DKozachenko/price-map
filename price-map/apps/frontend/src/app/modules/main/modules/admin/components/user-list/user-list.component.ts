import { Component, OnInit } from '@angular/core';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService, WebSocketService } from '../../../../../../services';

@UntilDestroy()
@Component({
  selector: 'admin-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  public users: User[] = [];
  public isLoading: boolean = false;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.webSocketService.on<IResponseData<null>>(UserEvents.GetUsersFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<User[]>>(UserEvents.GetUsersSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User[]>) => {
        this.users = response.data;
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<null>>(UserEvents.DeleteUserFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<string>>(UserEvents.DeleteUserSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<string>) => {
        this.webSocketService.emit<null>(UserEvents.GetUsersAttempt, null);
        this.isLoading = true;
      });

    this.webSocketService.emit<null>(UserEvents.GetUsersAttempt, null);
    this.isLoading = true;
  }

  public trackByUser(index: number, item: User): string {
    return item.id ?? index;
  }
}
