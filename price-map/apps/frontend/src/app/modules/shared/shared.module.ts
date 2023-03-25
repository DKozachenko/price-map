import { NbLayoutModule, NbIconModule, NbUserModule } from '@nebular/theme';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components';
import { RouterModule } from '@angular/router';
import { PricePipe } from './pipes';

/**
 * Общий модуль
 * @export
 * @class SharedModule
 */
@NgModule({
  declarations: [HeaderComponent, PricePipe],
  imports: [
    CommonModule, 
    NbLayoutModule, 
    NbIconModule, 
    RouterModule,
    NbUserModule
  ],
  exports: [HeaderComponent, PricePipe]
})
export class SharedModule { }
