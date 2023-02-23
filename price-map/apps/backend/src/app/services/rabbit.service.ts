import { Injectable, Logger } from '@nestjs/common';
import { from, Observable, switchMap, catchError, of } from 'rxjs';
import {Channel, connect, Connection, ConsumeMessage}from 'amqplib';

@Injectable()
export class RabbitService {
  public connection: Connection;
  public channel: Channel;

  public initConnection(): Observable<null> {
    return from(connect({
      protocol: 'amqp',
      username: 'guest',
      password: 'guest',
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
      )  
  }

  private getMessagePromise<T = any>(queueName: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.channel.consume(queueName, (message: ConsumeMessage) => {
        if (message === null) {
          Logger.error('Consumer cancelled by server', 'RabbitService');
          reject(message);
          return;
        }
        Logger.debug(`Message from ${queueName}`, 'RabbitService');
        try {
          const obj: T = <T>JSON.parse(message.content.toString());
          this.channel.ack(message);
          resolve(obj);
        } catch (err: any) {
          Logger.error(`Error while parsing JSON from ${queueName}, content: ${message.content.toString()}`, 'RabbitService');
          reject(err);
        }
        return;
      })
    })
  }

  public getMessage<T = any>(queueName: string): Observable<T> {
    return from(this.getMessagePromise<T>(queueName));
  }
}
