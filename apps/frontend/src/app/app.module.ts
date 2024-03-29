import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { appInitializer } from './initializers';
import { NotificationService, TokenService, WebSocketService, SettingsService } from './services';
import { HttpClientModule } from '@angular/common/http';
import { NbThemeModule, NbToastrModule, NbToastrService, NbIconModule, NbLayoutModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard, RolesGuard } from './guards';
import { CookieService } from 'ngx-cookie-service';
import { SharedModule } from './modules/shared/shared.module';
import { MainModule } from './modules/main/main.module';
import { AuthModule } from './modules/auth/auth.module';

/**
 * Главный модуль приложения
 * @export
 * @class AppModule
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NbThemeModule.forRoot({
      name: 'cosmic'
    }),
    NbToastrModule.forRoot(),
    NbEvaIconsModule,
    NbIconModule,
    NbLayoutModule,
    //Этот модули должны были быть по факту lazy loading, но если их таковыми сделать, то почему-то
    //не отправляется токен на бэк, баг из разряда "мэджик"
    AuthModule,
    MainModule,
    SharedModule
  ],
  providers: [
    AuthGuard,
    RolesGuard,
    WebSocketService,
    TokenService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [WebSocketService],
      multi: true,
    },
    NbToastrService,
    NotificationService,
    CookieService,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
