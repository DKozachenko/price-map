import { Observable, of, switchMap, from } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, User } from '@core/entities';
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm';

/**
 * Сервис пользователей
 * @export
 * @class UsersService
 */
@Injectable()
export class UsersService {
  /**
   * Репозиторий пользователей
   * @private
   * @type {Repository<User>}
   * @memberof UsersService
   */
  @InjectRepository(User, 'postgresConnect')
  private readonly userRepository: Repository<User>;

  /**
   * Репозиторий товаров
   * @private
   * @type {Repository<Product>}
   * @memberof UsersService
   */
  @InjectRepository(Product, 'postgresConnect')
  private readonly productRepository: Repository<Product>;

  /**
   * Получение по запросу
   * @param {FindOptionsWhere<User>} query запрос
   * @return {*}  {(Observable<User | null>)} пользователь
   * @memberof UsersService
   */
  public getByQuery(query: FindOptionsWhere<User>, isNeedProducts: boolean = false): Observable<User | null> {
    return from(this.userRepository.findOne({
      where: query,
      relations: {
        products: isNeedProducts
      }
    }));
  }

  /**
   * Обновление по id
   * @param {string} id id
   * @param {Partial<User>} partialUser обновляемые данные
   * @return {*}  {Observable<number>} кол-во затронутых строк
   * @memberof UsersService
   */
  public updateById(id: string, partialUser: Partial<User>): Observable<number> {
    return from(this.userRepository.update({ id }, { ...partialUser }))
      .pipe(
        switchMap((result: UpdateResult) => {
          return of(result.affected);
        })
      );
  }

  /**
   * Добавление
   * @param {Omit<User, 'id'>} newUser новый пользователь
   * @return {*}  {(Observable<User>)} сохраненный пользователь из БД
   * @memberof UsersService
   */
  public add(newUser: Omit<User, 'id'>): Observable<User> {
    return from(this.userRepository.save(newUser));
  }

  /**
   * Обновление связанных товаров (обновление избранного)
   * @param {string} userId id пользователя
   * @param {string[]} productIds id товаров
   * @return {*}  {Observable<User>} обновленный пользователь
   * @memberof UsersService
   */
  public updateFavoriteProducts(userId: string, productIds: string[]): Observable<User> {
    return from(this.productRepository.findBy({
      id: In(productIds)
    }))
      .pipe(
        switchMap((products: Product[]) => from(this.userRepository.save({
          id: userId,
          products
        })))
      );
  }
}
