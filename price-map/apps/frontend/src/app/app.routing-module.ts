import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent, MapComponent, SettingsComponent, UsersReviewComponent } from './components';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'map',
    component: MapComponent
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
