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
    this.socket = io('wss://localhost:3000');

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
