import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, TokenService, WebSocketService } from '../../../../services';
import { IResponseData, IUserLoginInfo } from '@core/interfaces';
import { AuthEvents } from '@core/enums';
import { Router } from '@angular/router';

/**
 * Компонет формы логина
 * @export
 * @class LoginComponent
 * @implements {OnInit}
 */
@UntilDestroy()
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

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService,
    private router: Router,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketSevice.on<IResponseData<string>>(AuthEvents.LoginSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<string>) => {
        this.form.reset();
        this.notificationService.showSuccess(response.message);
        this.tokenService.setToken(response.data ?? '');
        this.router.navigate(['map'], { queryParamsHandling: 'merge' });
      });
    
    this.webSocketSevice.on<IResponseData<null>>(AuthEvents.LoginFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => this.notificationService.showError(response.message));
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
    this.webSocketSevice.emit<IUserLoginInfo>(AuthEvents.LoginAttemp, this.form.value, false);
  }
}
