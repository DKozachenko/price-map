import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '@core/entities';
import { AuthEvents, UserEvents } from '@core/enums';
import { IPayload, IResponseData, IUserRegisterInfo } from '@core/interfaces';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { NotificationService, TokenService, WebSocketService } from '../../../../services';
import { SettingService } from '../../services';

@UntilDestroy()
@Component({
  selector: 'price-map-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  private user: User;
  public form!: FormGroup;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly tokenService: TokenService,
    private readonly settingService: SettingService,
    private readonly notificationService: NotificationService) {}

  public ngOnInit(): void {
    this.initForm();

    this.webSocketService.on<IResponseData<User>>(UserEvents.GetUserSuccessed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<User>) => {
        this.user = response.data;
        this.form.patchValue({
          ...response.data,
          password: undefined
        });
      });

    this.webSocketService.on<IResponseData<null>>(UserEvents.GetUserFailed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
      });

    this.webSocketService.on<IResponseData<User>>(UserEvents.UpdateUserSuccessed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<User>) => {
        console.log(response)
      });

    this.webSocketService.on<IResponseData<null>>(UserEvents.UpdateUserFailed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
      });

    const payload: IPayload = this.tokenService.getPayload();
    const userId: string = payload.userId;
    this.webSocketService.emit<string>(UserEvents.GetUserAttempt, userId);    
  }

  private initForm(): void {
    this.form = new FormGroup({
      name: new FormControl(undefined, [
        Validators.required,
        Validators.maxLength(100)
      ]),
      lastName: new FormControl(undefined, [
        Validators.required, 
        Validators.maxLength(100)
      ]),
      mail: new FormControl(undefined, [
        Validators.required, 
        Validators.maxLength(150), 
        Validators.email
      ]),
      nickname: new FormControl(undefined, [
        Validators.required, 
        Validators.maxLength(150)
      ]),
      password: new FormControl(undefined, [
        Validators.minLength(6),
        Validators.pattern(/(?=.*?[A-ZА-Я])(?=.*?[0-9])(?=.*?[a-zа-я])/)
      ]),
    });
  }
  
  public submit(): void {
    console.log({ 
      ...this.user,
      ...this.form.value
    });
    this.webSocketService.emit<User>(UserEvents.UpdateUserAttempt, { 
      ...this.user,
      ...this.form.value
    });
  }
}
