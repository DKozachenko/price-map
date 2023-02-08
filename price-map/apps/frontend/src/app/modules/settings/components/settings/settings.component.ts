import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'price-map-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public form!: FormGroup;

  public ngOnInit(): void {
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
  }
  
  public submit(): void {
    console.log(this.form.value)
    // this.webSocketSevice.emit<IUserRegisterInfo>(AuthEvents.RegisterAttemp, this.form.value);
  }
}
