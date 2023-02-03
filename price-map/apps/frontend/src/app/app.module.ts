import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { LoginComponent, MapComponent, RegisterComponent } from './components';
import { appInitializer } from './initializers';
import { TokenService, WebSocketService } from './services';
import { SettingsComponent } from './components/settings/settings.component';
import { UsersReviewComponent } from './components/users-review/users-review.component';
import { NotificationService } from './services/notification.service';
import { NbThemeModule, NbToastrModule, NbToastrService, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapComponent,
    SettingsComponent,
    UsersReviewComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NbThemeModule.forRoot({
      name: 'cosmic'
    }),
    NbToastrModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule,
    NbLayoutModule
  ],
  providers: [
    WebSocketService,
    TokenService,
    NotificationService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [WebSocketService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
