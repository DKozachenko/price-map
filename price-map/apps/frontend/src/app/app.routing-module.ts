import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, RolesGuard } from './guards';
import { Role } from '@core/enums';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
    title: 'Авторизация'
  },
  {
    path: 'map',
    canActivate: [
      AuthGuard,
      RolesGuard
    ],
    data: {
      roles: [
        Role.User,
        Role.Admin
      ]
    },
    loadChildren: () => import('./modules/map/map.module').then(m => m.MapModule),
    title: 'Карта'
  },
  {
    path: 'settings',
    canActivate: [
      AuthGuard,
      RolesGuard
    ],
    data: {
      roles: [
        Role.User,
        Role.Admin
      ]
    },
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule),
    title: 'Настройки'
  },
  {
    path: 'admin',
    canActivate: [
      AuthGuard,
      RolesGuard
    ],
    data: {
      roles: [Role.Admin]
    },
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    title: 'Админ-панель'
  },
  {
    path: '**',
    redirectTo: 'map',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
