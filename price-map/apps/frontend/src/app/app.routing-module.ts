import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent, MapComponent, RegisterComponent, SettingsComponent, UsersReviewComponent } from './components';
import { AuthGuard, RolesGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'map',
    component: MapComponent,
    canActivate: [
      AuthGuard,
      RolesGuard
    ],
    data: {
      roles: ['user']
    }
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'users-review',
    component: UsersReviewComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
