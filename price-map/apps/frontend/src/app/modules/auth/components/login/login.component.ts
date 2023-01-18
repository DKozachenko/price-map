import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, TokenService, WebSocketService } from '../../../../services';
import { IResponseData, IUserLoginInfo } from '@price-map/core/interfaces';
import { AuthEventNames } from '@price-map/core/enums';
import { IResponseCallback } from '../../../../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private onLoginSuccessed: IResponseCallback<IResponseData<string>> = (response: IResponseData<string>) => {
    this.form.reset();
    this.notificationService.showSuccess(response.message);
    this.tokenService.setToken(response.data ?? '');
    this.router.navigate(['map'], { queryParamsHandling: 'merge' });
  }

  private onLoginFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  }

  public isShowPassword: boolean = false;
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

    this.webSocketSevice.socket.on(AuthEventNames.LoginSuccessed, this.onLoginSuccessed);
    this.webSocketSevice.socket.on(AuthEventNames.LoginFailed, this.onLoginFailed);
  }

  public toggleInputType(): string {
    return this.isShowPassword ? 'text' : 'password';
  }

  public toggleShowPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  public submit(): void {
    this.webSocketSevice.emit<IUserLoginInfo>(AuthEventNames.LoginAttemp, this.form.value);
  }
}
