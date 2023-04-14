import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Category2Level, Category1Level } from '@core/entities';
import { DeleteResult, Repository } from 'typeorm';
import { from, Observable, of, switchMap, catchError } from 'rxjs';
import { DbErrorCode, RabbitErrorCode } from '@core/types';
import { RabbitService } from '../../../services';
import { CATEGORIES_QUEUE } from '../../../models/constants';
import { IMessage } from '../../../models/interfaces';

/**
 * Сервис категорий (всех уровней)
 * @export
 * @class CategoriesService
 * @implements {OnModuleInit}
 */
@Injectable()
export class CategoriesService implements OnModuleInit {
  /**
   * Репозиторий категорий 1 уровня
   * @private
   * @type {Repository<Category1Level>}
   * @memberof CategoriesService
   */
  @InjectRepository(Category1Level, 'postgresConnect')
  private readonly category1LevelRepository: Repository<Category1Level>;

  /**
   * Репозиторий категорий 2 уровня
   * @private
   * @type {Repository<Category2Level>}
   * @memberof CategoriesService
   */
  @InjectRepository(Category2Level, 'postgresConnect')
  private readonly category2LevelRepository: Repository<Category2Level>;

  /**
   * Репозиторий категорий 3 уровня
   * @private
   * @type {Repository<Category3Level>}
   * @memberof CategoriesService
   */
  @InjectRepository(Category3Level, 'postgresConnect')
  private readonly category3LevelRepository: Repository<Category3Level>;

  constructor(private readonly rabbitService: RabbitService) {}

  public onModuleInit(): void {      
    this.subscribeOnCategoriesQueue();
  }

  
  /**
   * Обновление данных по всем категориям (удаление и сохранение по новой)
   * @param {Omit<Category1Level, 'id'>[]} categories1Level категории 1 уровня
   * @return {*}  {Observable<Category1Level[]>} сохраненные категории 1 уровня из БД
   * @memberof CategoriesService
   */
  private refreshAllCategoriesData(categories1Level: Omit<Category1Level, 'id'>[]): Observable<Category1Level[]> {
    return this.deleteAllCategories1Level()
      .pipe(
        switchMap((affectedRows: number) => {
          Logger.warn(`Deleting categories: ${affectedRows} rows`, 'CategoriesService');
          return this.saveCategories1Level(categories1Level);
        })
      );
  }

  /**
   * Подписка на очередь с категориями
   * @private
   * @memberof CategoriesService
   */
  private subscribeOnCategoriesQueue(): void {
    const errorCodes: (RabbitErrorCode | DbErrorCode)[] = [
      'DB_ERROR',
      'GET_MESSAGE_ERROR'
    ];

    this.rabbitService.getMessage<Omit<Category1Level, 'id'>[]>(CATEGORIES_QUEUE)
      .pipe(
        switchMap((message: IMessage<Omit<Category1Level, 'id'>[]>) => {
          return this.refreshAllCategoriesData(message.data)
            .pipe(
              catchError((err: Error) => {
                Logger.error(`Error code: ${errorCodes[0]}, ${err}`, 'CategoriesService');
                return of(null);
              })
            );
        }),
        catchError((err: Error) => {
          Logger.error(`Error code: ${errorCodes[1]}, queue: ${CATEGORIES_QUEUE}, ${err}`, 'CategoriesService');
          return of(null);
        })
      )
      .subscribe((data: Category1Level[] | null) => {
        if (data) {
          Logger.log(`Successfully saving ${data.length} categories`, 'CategoriesService');
        }
      });
  }

  /**
   * Получений всех категорий 1 уровня
   * @return {*}  {Observable<Category1Level[]>} все категории 1 уровня
   * @memberof CategoriesService
   */
  public getAllCategories1Level(): Observable<Category1Level[]> {
    return from(this.category1LevelRepository.find({
      relations: {
        categories2Level: true,
      }
    }));
  }

  /**
   * Получение всех категорий 3 уровня
   * @return {*}  {Observable<Category3Level[]>} категории 3 уровня
   * @memberof CategoriesService
   */
  public getAllCategories3Level(): Observable<Category3Level[]> {
    return from(this.category3LevelRepository.find({}));
  }

  /**
   * Получение категории 3 уровня по id
   * @param {string} id id записи
   * @return {*}  {Observable<Category3Level>} категория 3 уровня
   * @memberof CategoriesService
   */
  public getCategory3LevelById(id: string): Observable<Category3Level> {
    return from(this.category3LevelRepository.findOne({
      where: {
        id
      }
    }));
  }

  /**
   * Удаление всех категорий 1 уровня (вместе со связанными категория 2 и 3 уровней)
   * @return {*}  {Observable<number>} кол-во затронутых строк
   * @memberof CategoriesService
   */
  public deleteAllCategories1Level(): Observable<number> {
    return from(this.category1LevelRepository.delete({}))
      .pipe(
        switchMap((result: DeleteResult) => of(result.affected))
      );
  }

  /**
   * Сохранение категорий 1 уровня (вместе со связанными категория 2 и 3 уровней)
   * @param {Omit<Category1Level, 'id'>[]} categories1Level категории 1 уровня
   * @return {*}  {Observable<Category1Level[]>} сохраненные категории 1 уровня из БД
   * @memberof CategoriesService
   */
  public saveCategories1Level(categories1Level: Omit<Category1Level, 'id'>[]): Observable<Category1Level[]> {
    return from(this.category1LevelRepository.save(categories1Level));
  }
}
