import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Category2Level, Category1Level } from '@core/entities';
import { DeleteResult, Repository } from 'typeorm';
import { from, Observable, of, switchMap } from 'rxjs';

/**
 * Сервис категорий (всех уровней)
 * @export
 * @class CategoriesService
 */
@Injectable()
export class CategoriesService {
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

  /**
   * Обновление данных по всем категориям (удаление и сохранение по новой)
   * @param {Omit<Category1Level, 'id'>[]} categories1Level категории 1 уровня 
   * @return {*}  {Observable<Category1Level[]>} сохраненные категории 1 уровня из БД
   * @memberof CategoriesService
   */
  public refreshAllCategoriesData(categories1Level: Omit<Category1Level, 'id'>[]): Observable<Category1Level[]> {
    return this.deleteAllCategories1Level()
      .pipe(
        switchMap((affectedRows: number) => {
          Logger.warn(`Deleting categories: ${affectedRows} rows`, 'CategoriesService');
          return this.saveCategories1Level(categories1Level);
        })
      );
  }
}
