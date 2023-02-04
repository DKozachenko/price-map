import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Component, Injector, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, TokenService, WebSocketService } from '../../../../services';
import { IResponseData, IUserLoginInfo } from '@core/interfaces';
import { AuthEvents, CategoryEvents } from '@core/enums';
import { Router } from '@angular/router';
import { Category1Level } from '@core/entities';

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
  private readonly webSocketSevice: WebSocketService;
  constructor(
    private readonly notificationService: NotificationService,
    private router: Router,
    private readonly tokenService: TokenService,
    private readonly injector: Injector) {
      this.webSocketSevice = injector.get(WebSocketService);
    }

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

      this.webSocketSevice.on<IResponseData<null>>(CategoryEvents.GetCategories1LevelFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => console.log(1, 'failed', response));

    this.webSocketSevice.on<IResponseData<Category1Level[]>>(CategoryEvents.GetCategories1LevelSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<Category1Level[]>) => console.log(2, 'successed', response));

    console.log(this.webSocketSevice.socket.auth)
    this.webSocketSevice.emit(CategoryEvents.GetCategories1LevelAttempt);
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
