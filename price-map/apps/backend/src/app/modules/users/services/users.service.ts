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
   * @return {*}  {Promise<User>} пользователь
   * @memberof UsersService
   */
  public async getByNickname(nickname: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        nickname
      }
    });
  }

  /**
   * Получение по почте
   * @param {string} mail почта
   * @return {*}  {Promise<User>} пользователь
   * @memberof UsersService
   */
  public async getByMail(mail: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        mail
      }
    });
  }

  /**
   * Добавление
   * @param {Omit<User, 'id'>} newUser новый пользователь
   * @return {*}  {Promise<void>}
   * @memberof UsersService
   */
  public async add(newUser: Omit<User, 'id'>): Promise<void> {
    await this.userRepository.insert(newUser);
  }
}
