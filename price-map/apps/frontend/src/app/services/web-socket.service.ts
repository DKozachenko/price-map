import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { TokenService } from '.';
import { IResponseCallback } from '../models/interfaces';

/**
 * Сервис общения с сервером по webSocket'у
 * @export
 * @class WebSocketService 
 */
@Injectable()
export class WebSocketService {
  /**
   * Количество попыток подключения
   * @private
   * @type {number}
   * @memberof WebSocketService
   */
  private connectAttempts: number = 0;
  /**
   * Максимальное количество попыток подключения
   * @private
   * @type {number}
   * @memberof WebSocketService
   */
  private maxConnectAttempts: number = 5;
  /**
   * Количество секунд, через которое происходит попытка переподключения
   * @private
   * @type {number}
   * @memberof WebSocketService
   */
  private reconnectSecs: number = 2;
  /**
   * Экзепляр сокета
   * @type {Socket}
   * @memberof WebSocketService
   */
  public socket!: Socket;

  constructor(private readonly tokenService: TokenService) {}

  /**
   * Инициализация сокета
   * @memberof WebSocketService
   */
  public initSocket(): void {
    this.socket = io('http://localhost:3333');

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', (err: Error) => {
      console.log('Socket connect error', err);

      ++this.connectAttempts;
      if (this.connectAttempts >= this.maxConnectAttempts) {
        this.socket.disconnect();
        return;
      }

      setTimeout(() => {
        this.socket.connect();
      }, this.reconnectSecs * 1000);
    });

    this.socket.on('disconnect', (reason: any, description: any) => {
      console.log('Socket disconnected', reason, description);
    });
  }

  /**
   * Добавлен токена к запросу
   * @memberof WebSocketService
   */
  public addToken(): void {
    this.socket.auth = {
      token: this.tokenService.getToken()
    };
  }

  /** 
   * Отправка данных
   * @template T тип отправляемых данных
   * @param {string} eventName название события
   * @param {T} data данные
   * @memberof WebSocketService
   */
  public emit<T>(eventName: string, data: T): void {
    this.socket.emit(eventName, data);
  }

  /**
   * Подписка на событие
   * @template T тип данных ответа от сервера
   * @param {string} eventName название события
   * @param {IResponseCallback<T>} callback колбэк 
   * @memberof WebSocketService
   */
  public on<T>(eventName: string, callback: IResponseCallback<T>) {
    this.socket.on(eventName, callback);
  }
}
