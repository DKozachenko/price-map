import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { appInitializer } from './initializers';
import { TokenService, WebSocketService } from './services';
import { HttpClientModule } from '@angular/common/http';
import { NbThemeModule, NbToastrModule, NbToastrService } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard, RolesGuard } from './guards';

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
    NbEvaIconsModule
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
    NbToastrService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
