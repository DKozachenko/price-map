import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, WebSocketService } from '../../../../services';
import { IUserRegisterInfo } from '@price-map/core/interfaces';
import { AuthEventNames } from '@price-map/core/enums';
import { IResponseData } from '@price-map/core/interfaces';
import { NbIconConfig, NbToastrService } from '@nebular/theme';
import { IResponseCallback } from '../../../../models/interfaces';
import { User } from '@price-map/core/entities';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private onRegisterSuccessed: IResponseCallback<IResponseData<User>> = (response: IResponseData<User>) => {
    this.form.reset();
    this.notificationService.showSuccess(response.message);
  }

  private onRegisterFailed: IResponseCallback<IResponseData<null>> = (response: IResponseData<null>) => {
    this.notificationService.showError(response.message);
  }

  public form!: FormGroup;

  constructor(private readonly webSocketSevice: WebSocketService,
    private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(undefined, [Validators.required, Validators.maxLength(100)]),
      lastName: new FormControl(undefined, [Validators.required, Validators.maxLength(100)]),
      mail: new FormControl(undefined, [Validators.required, Validators.maxLength(150), Validators.email]),
      nickname: new FormControl(undefined, [Validators.required, Validators.maxLength(150)]),
      password: new FormControl(undefined, [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/(?=.*?[A-ZА-Я])(?=.*?[0-9])(?=.*?[a-zа-я])/)
      ]),
    });

    this.webSocketSevice.socket.on(AuthEventNames.RegisterFailed, this.onRegisterFailed);
    this.webSocketSevice.socket.on(AuthEventNames.RegisterSuccessed, this.onRegisterSuccessed);
  }

  public submit(): void {
    this.webSocketSevice.emit<IUserRegisterInfo>(AuthEventNames.RegisterAttemp, this.form.value);
  }
}
