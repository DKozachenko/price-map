import { Injectable } from "@nestjs/common";
import { webSocket } from 'rxjs/webSocket';

@Injectable()
export class WebSocketService {
  public subject = webSocket('ws:http//localhost:3333/api');

  constructor() {
    this.subject.subscribe({
      next: msg => console.log('message received: ' + msg), // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
     });
  }
}
