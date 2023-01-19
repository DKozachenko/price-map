import { NbLayoutModule, NbIconModule } from '@nebular/theme';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, NbLayoutModule, NbIconModule, RouterModule],
  exports: [HeaderComponent]
})
export class SharedModule { }
