import { Injectable } from '@nestjs/common';

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

  async getByNickname(nickname: string): Promise<User | undefined> {
    return this.users.find(user => user.nickname === nickname);
  }

  async add(user: any): Promise<User> {
    const newUser = {
      nickname: user.nickname,
      password: user.password,
      role: user.role,
      userId: this.users.length + 1
    };
    this.users.push(newUser);
    return newUser;
  }
}
