import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { LoginComponent, MapComponent } from './components';
import { appInitializer } from './initializers';
import { WebSocketService } from './services';
import { SettingsComponent } from './components/settings/settings.component';
import { UsersReviewComponent } from './components/users-review/users-review.component';

@NgModule({
  declarations: [AppComponent, LoginComponent, MapComponent, SettingsComponent, UsersReviewComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [
    WebSocketService,
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
