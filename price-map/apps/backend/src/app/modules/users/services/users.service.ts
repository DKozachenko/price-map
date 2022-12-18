import { Injectable } from '@nestjs/common';
import { Role } from '../../auth/models/enums';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users: any[] = [
    {
      userId: 1,
      nickname: 'john',
      password: 'changeme',
      role: 'user'
    },
    {
      userId: 2,
      nickname: 'maria',
      password: 'guess',
      role: 'admin'
    },
  ];

  async findOne(nickname: string): Promise<User | undefined> {
    return this.users.find(user => user.nickname === nickname);
  }
}
