import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbIconModule,
  NbLayoutModule,
  NbButtonModule,
  NbAccordionModule,
  NbSpinnerModule} from '@nebular/theme';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FavoriteRoutingModule } from './favorite-routing.module';
import { FavoriteItemComponent, FavoriteListComponent } from './components';

@NgModule({
  declarations: [
    FavoriteListComponent,
    FavoriteItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FavoriteRoutingModule,
    NbLayoutModule,
    NbIconModule,
    NbAccordionModule,
    NbButtonModule,
    NbSpinnerModule,
    SharedModule
  ]
})
export class FavoriteModule { }
