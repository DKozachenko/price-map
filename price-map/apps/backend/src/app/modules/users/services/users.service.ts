import { from, Observable, of, switchMap } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@core/entities';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { IUserRegisterInfo } from '@core/interfaces';

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
   * Получение по запросу
   * @param {FindOptionsWhere<User>} query запрос
   * @return {*}  {(Observable<User | null>)} пользователь
   * @memberof UsersService
   */
  public getByQuery(query: FindOptionsWhere<User>): Observable<User | null> {
    return from(this.userRepository.findOne({
      where: query
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
   * @return {*}  {(Observable<User>)}
   * @memberof UsersService
   */
  public add(newUser: Omit<User, 'id'>): Observable<User> {
    return from(this.userRepository.save(newUser));
  }
}
