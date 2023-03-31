/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { from, Observable, switchMap, catchError, of } from 'rxjs';
import {Channel, connect, Connection, ConsumeMessage}from 'amqplib';

/**
 * Сервис взаимодействия с Rabbit
 * @export
 * @class RabbitService
 */
@Injectable()
export class RabbitService {
  /**
   * Текущее соединение
   * @private
   * @type {Connection}
   * @memberof RabbitService
   */
  private connection: Connection;
  /**
   * Текущий канад
   * @private
   * @type {Channel}
   * @memberof RabbitService
   */
  private channel: Channel;

  /**
   * Получение сообщения (возвращает Promise)
   * @private
   * @template T тип данных
   * @param {string} queueName название очереди
   * @return {*}  {Promise<T>} данные из сообщения
   * @memberof RabbitService
   */
  private getMessagePromise<T = any>(queueName: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.channel.consume(queueName, (message: ConsumeMessage) => {
        if (message === null) {
          reject(new Error('Consumer cancelled by server'));
          return;
        }
        
        const bytes: number = message.content.length;
        Logger.debug(`Message from ${queueName}, content length: ${bytes} bytes`, 'RabbitService');
        try {
          const obj: T = <T>JSON.parse(message.content.toString());
          this.channel.ack(message);
          resolve(obj);
        } catch (err: any) {
          reject(new Error(`Error while parsing JSON from ${queueName}, content length: ${bytes} bytes`));
        }
        return;
      });
    });
  }

  /**
   * Инициализация соединия
   * @return {*}  {Observable<null>}
   * @memberof RabbitService
   */
  public initConnection(): Observable<null> {
    return from(connect({
      protocol: 'amqp',
      username: 'admin',
      password: 'admin_rabbit',
      port: 5672
    }))
      .pipe(
        switchMap((connection: Connection) => {
          this.connection = connection;
          Logger.log('Rabbit init', 'RabbitService');
          return from(connection.createChannel())
            .pipe(
              catchError((err: any) => {
                Logger.error(`Error occured ${err} while create channel`, 'RabbitService');
                return of(null);
              })
            );
        }),
        switchMap((channel: Channel | null) => {
          if (channel) {
            Logger.log('Rabbit init channel', 'RabbitService');
            this.channel = channel;
          }
          return of(null);
        }),
        catchError((err: any) => {
          Logger.error(`Error occured ${err} while connect to Rabbit`, 'RabbitService');
          return of(null);
        })
      );
  }

  /**
   * Получение сообщения (возвращает Observable)
   * @template T тип данных
   * @param {string} queueName название очереди
   * @return {*}  {Observable<T>} данные из сообщения
   * @memberof RabbitService
   */
  public getMessage<T = any>(queueName: string): Observable<T> {
    return from(this.getMessagePromise<T>(queueName));
  }

  /**
   * Отправка сообщения
   * @template T тип отправляемых данных
   * @param {string} queueName название очереди
   * @param {T} data данные
   * @memberof RabbitService
   */
  public sendMessage<T = any>(queueName: string, data: T): void {
    const dataStr: string = JSON.stringify(data);
    this.channel.sendToQueue(queueName, Buffer.from(dataStr));
  }
}
