import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { DisconnectDescription } from 'socket.io-client/build/esm/socket';
import { TokenService } from '.';

/**
 * Сервис общения с сервером по webSocket'у
 * @export
 * @class WebSocketService 
 */
@Injectable()
export class WebSocketService implements OnDestroy {
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

  private connectSub!: Subscription;
  private connectErrorSub!: Subscription;
  private disconnectSub!: Subscription;
  /**
   * Экзепляр сокета
   * @type {Socket}
   * @memberof WebSocketService
   */
  public socket!: Socket;

  constructor(private readonly tokenService: TokenService) {}

  /**
   * Подписка на установку соединения
   * @private
   * @memberof WebSocketService
   */
  private subscribeOnConnect(): void {
    this.connectSub = this.on<null>('connect')
      .subscribe(() => console.log('Socket connected'));
  }

  /**
   * Подписка на попытку установки соединения
   * @private
   * @memberof WebSocketService
   */
  private subscribeOnErrorConnect(): void {
    this.connectErrorSub = this.on<Error>('connect_error')
      .subscribe((err: Error) => {
        console.error('Socket connect error', err);

        ++this.connectAttempts;
        if (this.connectAttempts >= this.maxConnectAttempts) {
          console.warn('The client stopped trying to connect');
          this.socket.disconnect();
          return;
        }

        setTimeout(() => {
          this.socket.connect();
        }, this.reconnectSecs * 1000);
      });
  }

  /**
   * Подписка на разрыв соединения
   * @private
   * @memberof WebSocketService
   */
  private subcribeOnDisconnect(): void {
    this.disconnectSub = this.on<[string, DisconnectDescription | undefined]>('disconnect')
      .subscribe(([
        reason, 
        description
      ]: [
        string, 
        DisconnectDescription | undefined
      ]) => 
        console.warn('Socket disconnected', 'reason ', reason, 'description', description)
      );
  }

  /**
   * Добавление токена к запросу
   * @memberof WebSocketService
   */
  private addToken(): void {
    this.socket.auth = {
      token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMjFiZTJlMi00OTc5LTQxYjgtODdmMi1jZDFmNzViZWQwNGYiLCJuaWNrbmFtZSI6ImRpYW5hIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjc1NDQxMDA1LCJleHAiOjE2NzU0NzcwMDV9._yehL9TnOLFwKBIjY03yaxoCDA1yU4Tt8tIxr_QR3ug'
    };
  }

  /**
   * Инициализация сокета
   * @memberof WebSocketService
   */
  public initSocket(): void {
    this.socket = io('http://localhost:3333');

    this.subscribeOnConnect();
    this.subscribeOnErrorConnect();
    this.subcribeOnDisconnect();
  }

  /** 
   * Отправка данных
   * @template T тип отправляемых данных
   * @param {string} eventName название события
   * @param {T} [data] данные
   * @memberof WebSocketService
   */
  public emit<T = null>(eventName: string, data?: T): void {
    this.addToken();
    this.socket.emit(eventName, data);
  }

  /**
   * Подписка на событие
   * @template T тип данных ответа от сервера
   * @param {string} eventName название события
   * @return {*}  {Observable<T>} данные от сервера
   * @memberof WebSocketService
   */
  public on<T>(eventName: string): Observable<T> {
    return fromEvent<T>(this.socket, eventName);
  }

  public ngOnDestroy(): void {
    this.connectSub.unsubscribe();
    this.connectErrorSub.unsubscribe();
    this.disconnectSub.unsubscribe();
  }
}
