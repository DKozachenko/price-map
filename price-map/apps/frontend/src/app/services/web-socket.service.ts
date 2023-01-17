import { Injectable } from '@angular/core';
import { io, Socket, Manager } from 'socket.io-client';
import { TokenService } from '.';
import { IResponseCallback } from '../models/interfaces';

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

  public addToken(): void {
    // this.socket = io('http://localhost:3333', {
    //   auth: {
    //     token: this.tokenService.getToken()
    //   }
    // });
    this.socket.auth = {
      token: this.tokenService.getToken()
    };
  }

  public emit<T>(eventName: string, data: T): void {
    this.socket.emit(eventName, data);
  }

  public on<T>(eventName: string, callback: IResponseCallback<T>) {
    this.socket.on(eventName, callback);
  }
}
