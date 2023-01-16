import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent, RegisterComponent, LayoutComponent } from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule,
  NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbTabsetModule, NbToastrService } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    LayoutComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbLayoutModule,
    NbTabsetModule,
    NbInputModule,
    NbIconModule,
    NbEvaIconsModule,
    NbFormFieldModule
  ],
  providers: [NbToastrService]
})
export class AuthModule { }
