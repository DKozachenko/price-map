import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService, TokenService } from '../../../../services';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public isShowPassword: boolean = false;

  public form!: FormGroup;

  constructor(private router: Router,
    private readonly webSocketSevice: WebSocketService,
    private readonly tokenService: TokenService) {}

  public ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketSevice.socket.on('login failed', (response: any) => {
      console.log('on login failed', response);
    });

    this.webSocketSevice.socket.on('login successed', (response: any) => {
      console.log('on login successed', response);
      this.tokenService.setToken(response.data);
      this.router.navigate(['map'], { queryParamsHandling: 'merge' });
    });
  }


  public toggleInputType(): string {
    return this.isShowPassword ? 'text' : 'password';
  }

  public toggleShowPassword(): void {
    this.isShowPassword = !this.isShowPassword;
  }

  public submit(): void {
    this.webSocketSevice.socket.emit('login attempt', this.form.value);
  }
}
