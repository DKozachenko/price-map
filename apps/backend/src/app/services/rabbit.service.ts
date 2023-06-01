/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { from, Observable, switchMap, catchError, of, Subscriber } from 'rxjs';
import { Channel, connect, Connection, ConsumeMessage }from 'amqplib';
import { IMessage } from '../models/interfaces';

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
   * Получение сообщения
   * @template T тип данных
   * @param {string} queueName название очереди
   * @return {*}  {Observable<IMessage<T>>} данные из сообщения
   * @memberof RabbitService
   */
  public getMessage<T = any>(queueName: string): Observable<IMessage<T>> {
    return new Observable<IMessage<T>>((subscribe: Subscriber<IMessage<T>>) => {
      this.channel.consume(queueName, (message: ConsumeMessage) => {
        if (message === null) {
          subscribe.error(new Error('Consumer cancelled by server'));
        }

        const bytes: number = message.content.length;
        Logger.debug(`Message from ${queueName}, content length: ${bytes} bytes`, 'RabbitService');
        try {
          const obj: IMessage<T> = <IMessage<T>>JSON.parse(message.content.toString());
          Logger.debug(`Описание: ${obj.description} было отправлено в ${obj.sendTime.toString()}`);
          this.channel.ack(message);
          subscribe.next(obj);
        } catch (err: any) {
          this.channel.ack(message);
          Logger.error(err, 'RabbitService');
          subscribe.error(new Error(`Error while parsing JSON from ${queueName}, content length: ${bytes} bytes`));
        }
      });
    });
  }

  /**
   * Отправка сообщения
   * @template T тип отправляемых данных
   * @param {string} queueName название очереди
   * @param {IMessage<T>} data данные
   * @memberof RabbitService
   */
  public sendMessage<T = any>(queueName: string, data: IMessage<T>): void {
    const dataStr: string = JSON.stringify(data);
    this.channel.sendToQueue(queueName, Buffer.from(dataStr));
  }
}
