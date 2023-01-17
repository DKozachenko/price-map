import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TokenService, WebSocketService } from '../../../../services';
import { IResponseData, IUserLoginInfo } from '@price-map/core/interfaces';
import { AuthEventNames } from '@price-map/core/enums';
import { IResponseCallback } from '../../../../models/interfaces';
import { NbIconConfig, NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private onLoginSuccessed: IResponseCallback<IResponseData<string>> = (response: IResponseData<string>) => {
    this.form.reset();
    const iconConfig: NbIconConfig = { icon: 'checkmark-circle-2-outline', pack: 'eva' };
    this.toastrService.show(response.message, 'Успех',
      {
        status: 'success',
        duration: 2000,
        destroyByClick: true,
        icon: iconConfig
      }
    );
    this.tokenService.setToken(response.data ?? '');
    this.router.navigate(['map'], { queryParamsHandling: 'merge' });
  }

  private onLoginFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    const iconConfig: NbIconConfig = { icon: 'minus-circle-outline', pack: 'eva' };
    this.toastrService.show(response.message, 'Ошибка',
      {
        status: 'danger',
        duration: 2000,
        destroyByClick: true,
        icon: iconConfig
      }
    )
  }

  public isShowPassword: boolean = false;
  public form!: FormGroup;

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly toastrService: NbToastrService,
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
