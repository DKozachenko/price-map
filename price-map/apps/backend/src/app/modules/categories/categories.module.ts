import { catchError, of, switchMap } from 'rxjs';
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { CategoriesService } from './services';
import { CategoriesGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category1Level, Category2Level, Category3Level } from '@core/entities';
import { JwtService } from '@nestjs/jwt';
import { RabbitService } from '../../services';
import { DbErrorCode, RabbitErrorCode } from '@core/types';

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
  constructor(private readonly rabbitService: RabbitService,
    private readonly categoriesService: CategoriesService) {}

  public onModuleInit(): void {
    const errorCodes: (RabbitErrorCode | DbErrorCode)[] = ['DB_ERROR', 'GET_MESSAGE_ERROR'];

    this.rabbitService.getMessage<Omit<Category1Level, 'id'>[]>('categories_queue')
      .pipe(
        switchMap((categories: Omit<Category1Level, 'id'>[]) => {
          return this.categoriesService.refreshAllCategoriesData(categories)
            .pipe(
              catchError((err: any) => {
                Logger.error(`Error code: ${errorCodes[0]}, ${err}`, 'CategoriesModule')
                return of(null);
              })
            )
        }),
        catchError((err: any) => {
          Logger.error(`Error code: ${errorCodes[1]}, queue: ${'categories_queue'}, ${err}`, 'CategoriesModule');
          return of(null);
        })
      )
      .subscribe((data: Category1Level[] | null) => {
        if (data) {
          Logger.log(`Successfully saving categories`, 'CategoriesModule');
        }
      }); 
  }
}
