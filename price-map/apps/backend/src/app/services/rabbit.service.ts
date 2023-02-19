import { Injectable, Logger } from '@nestjs/common';
import { ICoordinates } from '@core/interfaces';
import { HttpService } from '@nestjs/axios';
import { from, Observable, switchMap, catchError, of, bindCallback, Subject } from 'rxjs';
import * as bcrypt from 'bcrypt';
import {Channel, connect, Connection, ConsumeMessage}from 'amqplib';

@Injectable()
export class RabbitService {
  private connection: Connection;
  private channel: Channel;

  public connected$: Subject<boolean> = new Subject<boolean>();

  public initConnection(): void {
    from(connect({
      protocol: 'amqp',
      username: 'guest',
      password: 'guest',
      port: 5672
    }))
      .pipe(
        switchMap((connection: Connection) => {
          Logger.log('Rabbit init', 'RabbitService');
          return from(connection.createChannel())
            .pipe(
              catchError((err: any) => {
                Logger.error(`Error occured ${err} while create channel`, 'RabbitService');
                return of(null);
              })
            );
        }),
        catchError((err: any) => {
          Logger.error(`Error occured ${err} while connect to Rabbit`, 'RabbitService');
          return of(null);
        })
      )
      .subscribe((channel: Channel | null) => {
        if (channel) {
          console.log(123456345654);
          Logger.log('Rabbit init channel', 'RabbitService');
          this.channel = channel;
          this.connected$.next(true);
        }
      })
  }

  public getMessage<T>(queueName: string): Observable<T> {
    return from(this.channel.consume(queueName, (msg: ConsumeMessage) => msg))
      .pipe(
        switchMap((msg: any) => {
          console.log(msg);
          return of(JSON.parse(msg.content.toString()) as T)
        }),
        catchError((err: any) => {
          Logger.error(`Error occured ${err} while get message from queue ${queueName}, ${err}`, 'RabbitService');
          return of({} as T);
        })
      );

  }
}
