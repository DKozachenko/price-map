import { catchError, of } from 'rxjs';
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { CategoriesService } from './services';
import { CategoriesGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category1Level, Category2Level, Category3Level } from '@core/entities';
import { JwtService } from '@nestjs/jwt';
import { RabbitService } from '../../services';

/**
 * Модуль категорий (всех уровней)
 * @export
 * @class CategoriesModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([
    Category1Level,
    Category2Level,
    Category3Level
  ], 'postgresConnect')],
  providers: [
    JwtService,
    RabbitService,
    CategoriesGateway,
    CategoriesService,
  ]
})
export class CategoriesModule implements OnModuleInit {
  constructor(private readonly rabbitService: RabbitService) {}

  public onModuleInit() {
    this.rabbitService.getMessage<any>('test_queue')
      .pipe(
        catchError((err: any) => {
          Logger.error(`Error while getting message from ${'test_queue'}, ${err}`, 'CategoriesModule')
          return of({});
        })
      )
      .subscribe(d => console.log('god damn', d));
  }
}
