import { Component } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import io from 'socket.io-client'

@Component({
  selector: 'price-map-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';

  public send(): void {


    const subject = io('http://localhost:3333');

    subject.emit('send', { }, (res: any) => {
      console.log('res', res)
    })
  }
}
