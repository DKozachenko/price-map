import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, WebSocketService } from '../../../../services';
import { IUserRegisterInfo } from '@core/interfaces';
import { AuthEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { IResponseCallback } from '../../../../models/interfaces';
import { User } from '@core/entities';

/**
 * Компонент формы регистрации
 * @export
 * @class RegisterComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  /**
   * Экземпляр формы
   * @type {FormGroup}
   * @memberof RegisterComponent
   */
  public form!: FormGroup;

  /**
   * Колбэк, срабатывающий при успешной регистрации
   * @private
   * @param {IResponseData<User>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<User>>}
   * @memberof RegisterComponent
   */
  private onRegisterSuccessed: IResponseCallback<IResponseData<User>> = (response: IResponseData<User>) => {
    this.form.reset();
    this.notificationService.showSuccess(response.message);
  };

  /**
   * Колбэк, срабатывающий при неудачной регистрации
   * @private
   * @param {IResponseData<null>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<null>>}
   * @memberof RegisterComponent
   */
  private onRegisterFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  };

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
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
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/(?=.*?[A-ZА-Я])(?=.*?[0-9])(?=.*?[a-zа-я])/)
      ]),
    });

    this.webSocketSevice.socket.on(AuthEvents.RegisterFailed, this.onRegisterFailed);
    this.webSocketSevice.socket.on(AuthEvents.RegisterSuccessed, this.onRegisterSuccessed);
  }

  /**
   * Отправка формы
   * @memberof RegisterComponent
   */
  public submit(): void {
    this.webSocketSevice.emit<IUserRegisterInfo>(AuthEvents.RegisterAttemp, this.form.value);
  }
}
