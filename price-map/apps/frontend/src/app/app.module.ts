import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { appInitializer } from './initializers';
import { TokenService, WebSocketService } from './services';
import { HttpClientModule } from '@angular/common/http';
import { NbThemeModule } from '@nebular/theme';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NbThemeModule.forRoot({
      name: 'cosmic'
    }),
  ],
  providers: [
    WebSocketService,
    TokenService,
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
