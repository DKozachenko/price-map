import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { WebSocketService } from '../../services';

@Component({
  selector: 'price-map-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form!: FormGroup;

  constructor(private router: Router,
    private readonly webSocketSevice: WebSocketService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });
  }

  public submit(): void {
    this.webSocketSevice.socket.emit('login attempt', {
      nickname: 'john',
      password: 'changeme'
    });

    this.webSocketSevice.socket.on('login failed', (response) => {
      console.log('on login failed', response);
    });

    this.webSocketSevice.socket.on('login successed', (response) => {
      console.log('on login successed', response);
    });
  }
}
