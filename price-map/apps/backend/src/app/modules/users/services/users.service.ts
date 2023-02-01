import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@core/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  @InjectRepository(User, 'postgresConnect')
  private readonly userRepository: Repository<User>;

  async getByNickname(nickname: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        nickname
      }
    });
  }

  async getByMail(mail: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        mail
      }
    });
  }

  async add(newUser: Omit<User, 'id'>): Promise<void> {
    await this.userRepository.insert(newUser);
  }
}
