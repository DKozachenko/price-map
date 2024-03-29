import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService, WebSocketService } from '../../../../services';
import { IUserRegisterInfo } from '@core/interfaces';
import { AuthEvents } from '@core/enums';
import { IResponseData } from '@core/interfaces';
import { User } from '@core/entities';

/**
 * Компонент формы регистрации
 * @export
 * @class RegisterComponent
 * @implements {OnInit}
 */
@UntilDestroy()
@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  /**
   * Эмиттер состояния загрузки
   * @private
   * @type {EventEmitter<boolean>}
   * @memberof RegisterComponent
   */
  @Output() private loadingState: EventEmitter<boolean> = new EventEmitter();
  
  /**
   * Эмитер успешной регистрации
   * @private
   * @type {EventEmitter<void>}
   * @memberof RegisterComponent
   */
  @Output() private registerSuccessed: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Экземпляр формы
   * @type {FormGroup}
   * @memberof RegisterComponent
   */
  public form!: FormGroup;

  constructor(private readonly webSocketService: WebSocketService,
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

    this.webSocketService.on<IResponseData<null>>(AuthEvents.RegisterFailed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<null>) => {
        this.notificationService.showError(response.message);
        this.loadingState.emit(false);
      });

    this.webSocketService.on<IResponseData<User>>(AuthEvents.RegisterSuccessed)
      .pipe(untilDestroyed(this))
      .subscribe((response: IResponseData<User>) => {
        this.form.reset();
        this.notificationService.showSuccess(response.message);
        this.registerSuccessed.emit();
        this.loadingState.emit(false);
      });
  }

  /**
   * Отправка формы
   * @memberof RegisterComponent
   */
  public submit(): void {
    this.webSocketService.emit<IUserRegisterInfo>(AuthEvents.RegisterAttemp, this.form.value, false);
    this.loadingState.emit(true);
  }
}
