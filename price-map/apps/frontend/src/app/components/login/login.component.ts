import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { TokenService, WebSocketService } from '../../services';

@Component({
  selector: 'price-map-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form!: FormGroup;

  constructor(private router: Router,
    private readonly webSocketSevice: WebSocketService,
    private readonly tokenService: TokenService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketSevice.socket.on('login failed', (response) => {
      console.log('on login failed', response);
    });

    this.webSocketSevice.socket.on('login successed', (response) => {
      console.log('on login successed', response);
      this.tokenService.setToken(response.result);
      this.router.navigate(['map'], { queryParamsHandling: 'merge' })
    });

    this.webSocketSevice.socket.on('get users failed', (response) => {
      console.log('on get users failed', response);
    });

    this.webSocketSevice.socket.on('get users successed', (response) => {
      console.log('on get users successed', response);
    });

    this.webSocketSevice.emit('get users attempt', {
      test: 'dfsdf'
    });

    
  }

  public submit(): void {
    this.webSocketSevice.socket.emit('login attempt', {
      ...this.form.value,
      role: 'user'
    });
  }
}
