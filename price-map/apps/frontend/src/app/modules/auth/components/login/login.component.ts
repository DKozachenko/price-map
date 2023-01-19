import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, TokenService, WebSocketService } from '../../../../services';
import { IResponseData, IUserLoginInfo } from '@price-map/core/interfaces';
import { AuthEvents } from '@price-map/core/enums';
import { IResponseCallback } from '../../../../models/interfaces';
import { Router } from '@angular/router';

/**
 * Компонет формы логина
 * @export
 * @class LoginComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  /**
   * Показывать пароль
   * @type {boolean}
   * @memberof LoginComponent
   */
  public isShowPassword: boolean = false;
  
  /**
   * Экземпляр формы
   * @type {FormGroup}
   * @memberof LoginComponent
   */
  public form!: FormGroup;
  
  /**
   * Колбэк, срабатывающий при успешном входе
   * @private
   * @param {IResponseData<string>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<string>>}
   * @memberof LoginComponent
   */
  private onLoginSuccessed: IResponseCallback<IResponseData<string>> = (response: IResponseData<string>) => {
    this.form.reset();
    this.notificationService.showSuccess(response.message);
    this.tokenService.setToken(response.data ?? '');
    this.router.navigate(['map'], { queryParamsHandling: 'merge' });
  };

  /**
   * Колбэк, срабатывающий при неудачной попытке входа
   * @private
   * @param {IResponseData<null>} response ответ от сервера
   * @type {IResponseCallback<IResponseData<null>>}
   * @memberof LoginComponent
   */
  private onLoginFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  };

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService,
    private router: Router,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketSevice.socket.on(AuthEvents.LoginSuccessed, this.onLoginSuccessed);
    this.webSocketSevice.socket.on(AuthEvents.LoginFailed, this.onLoginFailed);
  }

  /** 
   * Смена флага, отвечающего за отображения пароля
   * @memberof LoginComponent
   */
  public toggleShowPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  /**
   * Отправка формы
   * @memberof LoginComponent
   */
  public submit(): void {
    this.webSocketSevice.emit<IUserLoginInfo>(AuthEvents.LoginAttemp, this.form.value);
  }
}
