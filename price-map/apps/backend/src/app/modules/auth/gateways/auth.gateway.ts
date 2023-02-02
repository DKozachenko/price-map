import { map, Observable, of, catchError, switchMap, EMPTY, NEVER, startWith, throwError } from 'rxjs';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../../users/services/users.service';
import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { secretKey } from '../../../models/constants';
import { IResponseData, IUserRegisterInfo, IUserLoginInfo } from '@core/interfaces';
import { User } from '@core/entities';
import { Role, AuthEvents } from '@core/enums';
import { AuthErrorCode } from '@core/types';
import { HashService } from '../services';
import { IPartialData } from '../models/interfaces';

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
    private readonly hashService: HashService,
    private readonly jwtService: JwtService) {}

  /**
   * Событие регистрации
   * @param {IUserRegisterInfo} userRegisterInfo информация для регистрации
   * @return {*}  {(Observable<WsResponse<IResponseData<User | null, AuthErrorCode | null>>>)} зарегистрованный пользователь
   * @memberof AuthGateway
   */
  @SubscribeMessage(AuthEvents.RegisterAttemp)
  public register(@MessageBody() userRegisterInfo: IUserRegisterInfo): Observable<WsResponse<IResponseData<User | null, AuthErrorCode | null>>> {
    let errorCode: AuthErrorCode;
    const errorCodePartialDataMap: Map<AuthErrorCode, IPartialData> = new Map<AuthErrorCode, IPartialData>([
      ['EXISTED_NICKNAME', {
        statusCode: 400,
        message: 'Пользователь с таким никнеймом уже существует'
      }],
      ['EXISTED_MAIL', {
        statusCode: 400,
        message: 'Пользователь с такой почтой уже существует'
      }],
      ['HASH_ERROR', {
        statusCode: 500,
        message: 'Ошибка при регистрации'
      }],
      ['DB_ERROR', {
        statusCode: 500,
        message: 'Ошибка при регистрации'
      }]
    ])

    return this.usersService.getByNickname(userRegisterInfo.nickname)
      .pipe(
        switchMap((userWithSameNickname: User | null) => {
          if (userWithSameNickname) {
            errorCode = 'EXISTED_NICKNAME';
            return throwError(() => new Error(`Error code: ${errorCode}, nickname: ${userRegisterInfo.nickname}`));         
          }
          return this.usersService.getByMail(userRegisterInfo.mail);
        }),
        switchMap((userWithSameMail: User | null) => {
          if (userWithSameMail) {
            errorCode = 'EXISTED_MAIL';
            return throwError(() => new Error(`Error code: ${errorCode}, mail: ${userRegisterInfo.mail}`)); 
          }

          return this.hashService.hashPassword(userRegisterInfo.password)
            .pipe(
              catchError((e: Error) => {
                errorCode = 'HASH_ERROR';
                return throwError(() => new Error(`Error code: ${errorCode}, error: ${e}`)); 
              }),
            )
        }),
        switchMap((hashedPassword: string) => {
          return this.usersService.add({
            ...userRegisterInfo,
            role: Role.User,
            password: hashedPassword,
            products: []
          })
            .pipe(
              catchError((e: Error) => {
                errorCode = 'DB_ERROR';
                return throwError(() => new Error(`Error code: ${errorCode}, error: ${e}`)); 
              }),
            )
        }),
        switchMap((newUser: User) => {
          return of({
            event: AuthEvents.RegisterSuccessed,
            data: {
              statusCode: 201,
              errorCode: null,
              isError: false,
              data: newUser,
              message: 'Пользователь успешно зарегистрирован'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'AuthGateway');
          const partialData: IPartialData | undefined = errorCodePartialDataMap.get(errorCode);
          return of({
            event: AuthEvents.RegisterFailed,
            data: {
              statusCode: partialData?.statusCode,
              errorCode,
              isError: true,
              data: null,
              message: partialData?.message            
            }
          });
        })
      );
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
