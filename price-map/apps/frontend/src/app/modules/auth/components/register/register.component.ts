import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../../services';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public form!: FormGroup;

  constructor(private router: Router,
    private readonly webSocketSevice: WebSocketService) {}

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
  }

  public submit(): void {
    this.webSocketSevice.socket.emit('register attempt', this.form.value);
  }
}
