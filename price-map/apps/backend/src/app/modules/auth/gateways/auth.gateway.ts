import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../../users/services/users.service';
import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import * as bcrypt from 'bcrypt';
import { jwtConstant } from '../../../constants';
import { IResponseData, IUserRegisterInfo, IUserLoginInfo } from '@price-map/core/interfaces';
import { User } from '@price-map/core/entities';
import { Role, AuthEvents } from '@price-map/core/enums';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AuthGateway {
  constructor (private readonly usersService: UsersService,
    private readonly jwtService: JwtService) {}

  @SubscribeMessage(AuthEvents.RegisterAttemp)
  public async register(@MessageBody() userRegisterInfo: IUserRegisterInfo): Promise<WsResponse<IResponseData<User>>> {
    const userWithSameNickname = await this.usersService.getByNickname(userRegisterInfo.nickname);
    if (userWithSameNickname) {
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 401,
          error: true,
          message: 'Пользователь с таким никнеймом уже существует',
          data: null
        }
      };
    }

    const userWithSameMail = await this.usersService.getByMail(userRegisterInfo.mail);
    if (userWithSameMail) {
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 401,
          error: true,
          message: 'Пользователь с такой почтой уже существует',
          data: null
        }
      };
    }

    let salt: string;
    let password: string;
    let hash: string;
    try {
      salt = await bcrypt.genSalt();
      password = userRegisterInfo.password;
      hash = await bcrypt.hash(password, salt);
    } catch (e: any) {
      Logger.error(e, 'AuthGateway')
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 405,
          error: true,
          message: 'Ошибка при хэшировании пароля',
          data: null
        }
      };
    }

    try {
      await this.usersService.add({
        ...userRegisterInfo,
        role: Role.User,
        password: hash,
        products: []
      });

      return {
        event: AuthEvents.RegisterSuccessed,
        data: {
          statusCode: 201,
          error: false,
          data: {
            ...userRegisterInfo,
            role: Role.User,
            password: hash,
            products: [],
            id: ''
          },
          message: 'Пользователь успешно зарегистрирован'
        }
      };
    } catch (e: any) {
      Logger.error(e, 'AuthGateway')
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 500,
          error: true,
          data: null,
          message: 'Ошибка при сохранении в базу данных'
        }
      };
    }
  }

  @SubscribeMessage(AuthEvents.LoginAttemp)
  public async login(@MessageBody() userLoginInfo: IUserLoginInfo): Promise<WsResponse<IResponseData<string>>> {
    const user: User = await this.usersService.getByNickname(userLoginInfo.nickname);

    if (!user) {
      return {
        event: AuthEvents.LoginFailed,
        data: {
          statusCode: 401,
          error: true,
          data: null,
          message: 'Пользователь с таким логином не существует'
        }
      };
    }

    const isMatchPassword: boolean = await bcrypt.compare(userLoginInfo.password, user.password);

    if (!isMatchPassword) {
      return {
        event: AuthEvents.LoginFailed,
        data: {
          statusCode: 400,
          error: true,
          data: null,
          message: 'Указан неверный пароль'
        }
      };
    }

    const token: string = this.jwtService.sign({
      userId: user.id,
      nickname: user.nickname,
      role: user.role
    }, {
      expiresIn: '10h',
      secret: jwtConstant.secret
    });

    return {
      event: 'login successed',
      data: {
        statusCode: 200,
        error: false,
        data: `Bearer ${token}`,
        message: 'Вход успешно произведен'
      }
    };

  }

}
