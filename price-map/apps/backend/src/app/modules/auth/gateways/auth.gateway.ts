import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../../users/services/users.service';
import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import * as bcrypt from 'bcrypt';
import { secretKey } from '../../../models/constants';
import { IResponseData, IUserRegisterInfo, IUserLoginInfo } from '@core/interfaces';
import { User } from '@core/entities';
import { Role, AuthEvents } from '@core/enums';
import { AuthErrorCode } from '@core/types';

/**
 * Шлюз авторизации
 * @export
 * @class AuthGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AuthGateway {
  constructor (private readonly usersService: UsersService,
    private readonly jwtService: JwtService) {}

  /**
   * Событие регистрации
   * @param {IUserRegisterInfo} userRegisterInfo информация для регистрации
   * @return {*}  {Promise<WsResponse<IResponseData<User>>>} данные о зарегистрированном пользователе
   * @memberof AuthGateway
   */
  @SubscribeMessage(AuthEvents.RegisterAttemp)
  public async register(@MessageBody() userRegisterInfo: IUserRegisterInfo): Promise<WsResponse<IResponseData<User | null, AuthErrorCode | null>>> {
    const userWithSameNickname = await this.usersService.getByNickname(userRegisterInfo.nickname);
    if (userWithSameNickname) {
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 400,
          errorCode: 'EXISTED_NICKNAME',
          isError: true,
          data: null,
          message: 'Пользователь с таким никнеймом уже существует'
        }
      };
    }

    const userWithSameMail = await this.usersService.getByMail(userRegisterInfo.mail);
    if (userWithSameMail) {
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 400,
          errorCode: 'EXISTED_MAIL',
          isError: true,
          data: null,
          message: 'Пользователь с такой почтой уже существует'
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
      Logger.error(e, 'AuthGateway');
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 500,
          errorCode: 'HASH_ERROR',
          isError: true,
          data: null,
          message: 'Ошибка при регистрации'
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
          errorCode: null,
          isError: false,
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
      Logger.error(e, 'AuthGateway');
      return {
        event: AuthEvents.RegisterFailed,
        data: {
          statusCode: 500,
          errorCode: 'DB_ERROR',
          isError: true,
          data: null,
          message: 'Ошибка при регистрации'
        }
      };
    }
  }

  /**
   * Событие входа
   * @param {IUserLoginInfo} userLoginInfo данные для входа
   * @return {*}  {Promise<WsResponse<IResponseData<string>>>} токен
   * @memberof AuthGateway
   */
  @SubscribeMessage(AuthEvents.LoginAttemp)
  public async login(@MessageBody() userLoginInfo: IUserLoginInfo): Promise<WsResponse<IResponseData<string | null, AuthErrorCode | null>>> {
    const user: User = await this.usersService.getByNickname(userLoginInfo.nickname);

    if (!user) {
      return {
        event: AuthEvents.LoginFailed,
        data: {
          statusCode: 400,
          errorCode: 'NON_EXISTENT_LOGIN',
          isError: true,
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
          errorCode: 'WRONG_PASSWORD',
          isError: true,
          data: null,
          message: 'Неверный пароль'
        }
      };
    }

    const token: string = this.jwtService.sign({
      userId: user.id,
      nickname: user.nickname,
      role: user.role
    }, {
      expiresIn: '10h',
      secret: secretKey
    });

    return {
      event: 'login successed',
      data: {
        statusCode: 200,
        errorCode: null,
        isError: false,
        data: `Bearer ${token}`,
        message: 'Вход успешно произведен'
      }
    };

  }

}
