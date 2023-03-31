import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsFormComponent } from './components';
import { SettingsRoutingModule } from './settings-routing.module';
import { NbCardModule,
  NbCheckboxModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbRadioModule,
  NbSelectModule,
  NbButtonModule,
  NbSpinnerModule} from '@nebular/theme';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Модуль настроек
 * @export
 * @class SettingsModule
 */
@NgModule({
  declarations: [SettingsFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsRoutingModule,
    NbLayoutModule,
    NbIconModule,
    NbCardModule,
    NbCheckboxModule,
    NbRadioModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
    NbSpinnerModule,
    SharedModule
  ]
})
export class SettingsModule { }
