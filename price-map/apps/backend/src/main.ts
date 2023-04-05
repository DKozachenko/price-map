import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { switchMap, Observable, EMPTY, catchError, from, of } from 'rxjs';
import { AppModule } from './app/app.module';
import { RabbitService } from './app/services';
// import CronJob = require('cron');
// import { CronJob } from '@types/cron';

/**
 * Необходимость в изменении дефолтного main.ts возникла из-за необходимо изначальной инициализации соединия с Rabbit
 * тк при инициализации в корневом модуле асинхронно происходит соединение и инициализация всех модулей,
 * инициализация модулей происходит быстрее и поэтому взаимодействие с Rabbit недоступно в других модулях
 */
function start(): Observable<void> {
  const globalPrefix: string = 'api';
  const port: number | string = process.env.PORT || 3333;
  let app: INestApplication;

  return from(NestFactory.create(AppModule))
    .pipe(
      switchMap((nestApp: INestApplication) => {
        app = nestApp;
        app.setGlobalPrefix(globalPrefix);
        const rabbitService = app.get(RabbitService);
        return rabbitService.initConnection();
      }),
      switchMap(() => from(app.listen(port))),
      switchMap(() => {
        Logger.log(
          `Server is running on: http://localhost:${port}/${globalPrefix}`,
          'bootstrap'
        );
        return of(null);
      }),
      switchMap(() => {
        // scheduling the backup job
        const job: CronJon = new CronJob('59 23 * * *',
          function () {
            console.log('-------Running cron job-------');
            backupDatabase();
          },
          null,
          true
        );

        return EMPTY;
      }),
      catchError((err: Error) => {
        Logger.error(`Error occured while starting app, ${err}`, 'bootstrap');
        return EMPTY;
      })
    );
}

start().subscribe();
