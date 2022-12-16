import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";

@Injectable()
export class WebSocketService {
  public socket!: Socket;

  /** Инициализация сокета */
  public initSocket(): void {
    this.socket = io('wss://localhost:3000');

    this.socket.on("connect", () => {
      console.log('Socket connected');
    });

    this.socket.on("connect_error", () => {
      console.log('Socket connect error');
    });

    this.socket.on("disconnect", () => {
      console.log('Socket disconnected');
    });
  }
}
