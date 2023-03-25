import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent, MenuComponent } from './components';
import { MainRoutingModule } from './main-routing.module';
import { MapModule } from './modules/map/map.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminModule } from './modules/admin/admin.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbIconModule, NbLayoutModule } from '@nebular/theme';

@NgModule({
  declarations: [
    LayoutComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    //Этот модули должны были быть по факту lazy loading, но если их таковыми сделать, то почему-то
    //не отправляется токен на бэк, баг из разряда "мэджик" 
    MapModule,
    SettingsModule,
    AdminModule,
    FavoriteModule,
  ]
})
export class MainModule { }
