import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent, MenuComponent } from './components';
import { MainRoutingModule } from './main-routing.module';

@NgModule({
  declarations: [
    LayoutComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ]
})
export class MainModule { }
