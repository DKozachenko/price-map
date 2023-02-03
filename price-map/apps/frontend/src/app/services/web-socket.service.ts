import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { TokenService } from '.';

@Injectable()
export class WebSocketService {
  private connectAttempts: number = 0;
  private timeoutSecs: number = 2;
  private maxConnectAttempts: number = 5;
  public socket!: Socket;

  constructor(private readonly tokenService: TokenService) {

  }

  /** Инициализация сокета */
  public initSocket(): void {
    this.socket = io('http://localhost:3333');

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

  public emit<T = null>(eventName: string, data?: T): void {
    this.addToken();
    this.socket.emit(eventName, data);
  }

  public addToken(): void {
    // console.log(this.socket.auth);
    if (!this.socket.auth) {
      console.log(1);
      this.socket.auth = { 
        token: this.tokenService.getToken()
      };
      this.socket.disconnect().connect();
    }
    // this.socket.auth = (cb) => {
    //   cb({ token: this.tokenService.getToken() })
    // }
  }
}
