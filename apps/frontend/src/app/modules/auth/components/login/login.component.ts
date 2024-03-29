import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
   * Эмиттер состояния загрузки
   * @private
   * @type {EventEmitter<boolean>}
   * @memberof LoginComponent
   */
  @Output() private loadingState: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  constructor(private readonly webSocketService: WebSocketService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketService.on<IResponseData<string>>(AuthEvents.LoginSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<string>) => {
        this.form.reset();
        this.notificationService.showSuccess(response.message);
        this.tokenService.setToken(response.data ?? '');
        this.router.navigate(['map'], { queryParamsHandling: 'merge' });
        this.loadingState.emit(false);
      });

    this.webSocketService.on<IResponseData<null>>(AuthEvents.LoginFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.loadingState.emit(false);
      });
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
    this.webSocketService.emit<IUserLoginInfo>(AuthEvents.LoginAttemp, this.form.value, false);
    this.loadingState.emit(true);
  }
}
