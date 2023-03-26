import { NgModule } from '@angular/core';
import { LayoutComponent } from './components';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, RolesGuard } from '../../guards';
import { Role } from '@core/enums';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path:'',
        redirectTo: 'map',
        pathMatch: 'full' 
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
        path: 'favorite',
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
        loadChildren: () => import('./modules/favorite/favorite.module').then(m => m.FavoriteModule),
        title: 'Избранное'
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
    ]
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
