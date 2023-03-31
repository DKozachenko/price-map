import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '@core/entities';
import { UserEvents } from '@core/enums';
import { IPayload, IResponseData } from '@core/interfaces';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { NotificationService, SettingsService, TokenService, WebSocketService } from '../../../../../../services';

/**
 * Компонент формы настроек пользователя
 * @export
 * @class SettingsFormComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'settings-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.scss'],
})
export class SettingsFormComponent implements OnInit {
  /**
   * Текущий пользователь
   * @private
   * @type {User}
   * @memberof SettingsComponent
   */
  private user: User;
  /**
   * Форма
   * @type {FormGroup}
   * @memberof SettingsComponent
   */
  public form!: FormGroup;

  /**
   * Происходит ли загрузка
   * @type {boolean}
   * @memberof SettingsFormComponent
   */
  public isLoading: boolean = false;

  constructor(private readonly webSocketService: WebSocketService,
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
    private readonly settingsService: SettingsService) {}

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
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<null>>(UserEvents.GetUserFailed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<Omit<User, 'password'> & { password?: string }>>(UserEvents.UpdateUserSuccessed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<Omit<User, 'password'> & { password?: string }>) => {
        this.settingsService.emitUpdateUser();
        this.notificationService.showSuccess(response.message);
        this.isLoading = false;
      });

    this.webSocketService.on<IResponseData<null>>(UserEvents.UpdateUserFailed)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.isLoading = false;
      });

    const payload: IPayload = this.tokenService.getPayload();
    const userId: string = payload.userId;
    this.isLoading = true;
    this.webSocketService.emit<string>(UserEvents.GetUserAttempt, userId);
  }

  /**
   * Инициализация формы
   * @private
   * @memberof SettingsComponent
   */
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

  /**
   * Отправка формы
   * @memberof SettingsComponent
   */
  public submit(): void {
    this.isLoading = true;
    this.webSocketService.emit<User>(UserEvents.UpdateUserAttempt, {
      ...this.user,
      ...this.form.value
    });
  }
}
