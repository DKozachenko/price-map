import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      nickname: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      nickname: 'maria',
      password: 'guess',
    },
  ];

  async findOne(nickname: string): Promise<User | undefined> {
    return this.users.find(user => user.nickname === nickname);
  }
}
