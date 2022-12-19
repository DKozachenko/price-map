import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class WebSocketService {
  private connectAttempts: number = 0;
  private timeoutSecs: number = 2;
  private maxConnectAttempts: number = 5;
  public socket!: Socket;

  /** Инициализация сокета */
  public initSocket(): void {
    this.socket = io('http://localhost:3333', {
      auth: {
        token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsIm5pY2tuYW1lIjoibG94Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE2NzE0NDg0NTMsImV4cCI6MTY3MTQ4NDQ1M30.PKyc9woT8WOtwcq3X50GaKj0Yv86ZlsAAJCNH59eybE'
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', () => {
      ++this.connectAttempts;
      if (this.connectAttempts >= this.maxConnectAttempts) {
        this.socket.disconnect();
        return;
      }

      setTimeout(() => {
        this.socket.connect();
      }, this.timeoutSecs * 1000);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
  }
}
