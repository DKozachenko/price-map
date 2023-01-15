import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent, RegisterComponent } from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule } from '@nebular/theme';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NbButtonModule
  ]
})
export class AuthModule { }
