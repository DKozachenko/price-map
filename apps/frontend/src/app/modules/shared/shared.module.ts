import { NbLayoutModule, NbIconModule, NbUserModule } from '@nebular/theme';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PricePipe } from './pipes';

/**
 * Общий модуль
 * @export
 * @class SharedModule
 */
@NgModule({
  declarations: [PricePipe],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbIconModule,
    RouterModule,
    NbUserModule
  ],
  exports: [PricePipe]
})
export class SharedModule { }
