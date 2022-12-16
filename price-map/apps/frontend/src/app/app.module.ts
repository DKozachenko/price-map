import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing-module';
import { LoginComponent, MapComponent } from './components';
import { appInitializer } from './initializers';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { 
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
     },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
