import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(nickname: string, password: string): Promise<any> {
    const user = await this.usersService.getByNickname(nickname);
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { nickname: user.nickname, userId: user.userId, role: user.role };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
