import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent, MapComponent, RegisterComponent, SettingsComponent, UsersReviewComponent } from './components';
import { AuthGuard, RolesGuard } from './guards';
import { LayoutComponent } from './modules/auth/components';
import { WebSocketService } from './services';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: LayoutComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
