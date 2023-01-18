import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, RolesGuard } from './guards';
import { Role } from '@price-map/core/enums';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
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
    loadChildren: () => import('./modules/map/map.module').then(m => m.MapModule)
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
    loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
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
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
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
