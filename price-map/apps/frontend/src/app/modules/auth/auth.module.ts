import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent, RegisterComponent, LayoutComponent } from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule,
  NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbTabsetModule } from '@nebular/theme';
import { provideErrorTailorConfig } from '@ngneat/error-tailor';

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
    NbFormFieldModule
  ],
  providers: [
    provideErrorTailorConfig({
      errors: {
        useValue: {
          required: 'Поле является обязательным',
          minlength: ({ requiredLength, actualLength }) =>
            `Ожидалось ${requiredLength} символов, но сейчас есть ${actualLength}`,
        }
      }
    })
  ]
})
export class AuthModule { }
