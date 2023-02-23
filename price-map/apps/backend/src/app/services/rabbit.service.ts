import { Injectable, Logger } from '@nestjs/common';
import { ICoordinates } from '@core/interfaces';
import { HttpService } from '@nestjs/axios';
import { from, Observable, switchMap, catchError, of, bindCallback, Subject } from 'rxjs';
import * as bcrypt from 'bcrypt';
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

  // public getMessage<T>(queueName: string): Observable<T> {
  //   // this.co
  //   return obs
  //     .pipe(
  //       switchMap(() => {
  //         return from(this.channel.consume(queueName, (msg: ConsumeMessage) => {
  //           console.log('cring', msg)
  //         }))
  //         .pipe(
  //           switchMap((msg: any) => {
  //             console.log(5, msg);
  //             return of(JSON.parse(msg.content.toString()) as T)
  //           }),
  //           catchError((err: any) => {
  //             Logger.error(`Error occured ${err} while get message from queue ${queueName}, ${err}`, 'RabbitService');
  //             return of({} as T);
  //           })
  //         );
  //       })
  //     )
  // }
}
