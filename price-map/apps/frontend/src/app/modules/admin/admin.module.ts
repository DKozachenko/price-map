import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserListComponent, UserComponent, FavoriteListComponent, FavoriteItemComponent } from './components';
import { AdminRoutingModule } from './admin-routing.module';
import { NbAccordionModule, NbButtonModule, NbIconModule, NbLayoutModule, NbTagModule } from '@nebular/theme';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [UserListComponent, UserComponent, FavoriteListComponent, FavoriteItemComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    NbLayoutModule,
    NbIconModule,
    NbAccordionModule,
    NbButtonModule,
    NbTagModule,
    SharedModule
  ]
})
export class AdminModule { }
