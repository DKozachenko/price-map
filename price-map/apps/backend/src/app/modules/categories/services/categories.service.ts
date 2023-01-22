import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Category2Level, Category1Level } from '@core/entities';
import { Repository } from 'typeorm';

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
   * @return {*}  {Promise<Category1Level[]>} все категории 1 уровня
   * @memberof CategoriesService
   */
  public async getAllCategories1Level(): Promise<Category1Level[]> {
    return this.category1LevelRepository.find({
      //TODO: с учетом настроек, возможно сам подтянет
      relations: {
        categories2Level: true,
      }
    });
  }

  /**
   * Получение категории 3 уровня по id
   * @param {string} id id записи
   * @return {*}  {Promise<Category3Level>} категория 3 уровня
   * @memberof CategoriesService
   */
  public async getCategory3LevelById(id: string): Promise<Category3Level> {
    return this.category3LevelRepository.findOne({
      where: {
        id
      }
    });
  }
}
