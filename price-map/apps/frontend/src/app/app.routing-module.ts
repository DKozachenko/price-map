import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, RolesGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
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
        'user',
        'admin'
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
        'user',
        'admin'
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
      roles: ['admin']
    },
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
