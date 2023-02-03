import { from, Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@core/entities';
import { Repository } from 'typeorm';

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
   * Получение по никнейму
   * @param {string} nickname никнейм
   * @return {*}  {(Observable<User | null>)} пользователь
   * @memberof UsersService
   */
  public getByNickname(nickname: string): Observable<User | null> {
    return from(this.userRepository.findOne({
      where: {
        nickname
      }
    }));
  }

  /**
   * Получение по почте
   * @param {string} mail почта
   * @return {*}  {(Observable<User | null>)} пользователь
   * @memberof UsersService
   */
  public getByMail(mail: string): Observable<User | null> {
    return from(this.userRepository.findOne({
      where: {
        mail
      }
    }));
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
