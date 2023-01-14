import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WebSocketService } from '../../../../services';

@Component({
  selector: 'price-map-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public form!: FormGroup;

  constructor(private router: Router,
    private readonly webSocketSevice: WebSocketService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });

    this.webSocketSevice.socket.on('register failed', (response: any) => {
      console.log('on register failed', response);
      alert('Глаза разуй, дебил, данные чекни');
    });

    this.webSocketSevice.socket.on('register successed', (response: any) => {
      console.log('on register successed', response);
    });
  }

  public submit(): void {
    this.webSocketSevice.socket.emit('register attempt', {
      ...this.form.value,
      name: 'test name ' + Math.random(),
      lastName: 'test last name ' + Math.random(),
      mail: 'test mail ' + Math.random()
    });
  }
}
