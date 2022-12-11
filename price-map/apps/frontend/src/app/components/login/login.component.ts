import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';

@Component({
  selector: 'price-map-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public form!: FormGroup;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      nickname: new FormControl(undefined, [Validators.required]),
      password: new FormControl(undefined, [Validators.required]),
    });
  }

  public submit(): void {
    const subject = io('http://localhost:3333');

    subject.connect();

    subject.on('connect', () => {
      console.log('connect');
    });


    subject.emit('send', {data: 'data'});

    subject.on('send', (response) => {
      console.log('on send', response);
    });

  }
}
