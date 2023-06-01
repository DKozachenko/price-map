import { Observable, of, catchError, switchMap, throwError } from 'rxjs';
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
import { HashService } from '../../../services';
import { IPartialData } from '../../../models/interfaces';

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
  public register(@MessageBody() userRegisterInfo: IUserRegisterInfo): 
    Observable<WsResponse<IResponseData<User | null, AuthErrorCode | null>>> {
    let errorCode: AuthErrorCode;
    const errorCodePartialDataMap: Map<AuthErrorCode, IPartialData> = new Map<AuthErrorCode, IPartialData>([
      [
        'EXISTED_NICKNAME', 
        {
          statusCode: 400,
          message: 'Пользователь с таким никнеймом уже существует'
        }
      ],
      [
        'EXISTED_MAIL', 
        {
          statusCode: 400,
          message: 'Пользователь с такой почтой уже существует'
        }
      ],
      [
        'HASH_ERROR', 
        {
          statusCode: 500,
          message: 'Ошибка при регистрации'
        }
      ],
      [
        'DB_ERROR', 
        {
          statusCode: 500,
          message: 'Ошибка при регистрации'
        }
      ]
    ]);

    return this.usersService.getByQuery({ nickname: userRegisterInfo.nickname })
      .pipe(
        switchMap((userWithSameNickname: User | null) => {
          if (userWithSameNickname) {
            errorCode = 'EXISTED_NICKNAME';
            return throwError(() => new Error(`Error code: ${errorCode}, nickname: ${userRegisterInfo.nickname}`));
          }
          return this.usersService.getByQuery({ mail: userRegisterInfo.mail });
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
            );
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
            );
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
              statusCode: partialData?.statusCode ?? 400,
              errorCode,
              isError: true,
              data: null,
              message: partialData?.message ?? 'Неизвестная ошибка'             
            }
          });
        })
      );
  }

  /**
   * Событие входа
   * @param {IUserLoginInfo} userLoginInfo данные для входа
   * @return {*}  {(Observable<WsResponse<IResponseData<string | null, AuthErrorCode | null>>>)} токен
   * @memberof AuthGateway
   */
  @SubscribeMessage(AuthEvents.LoginAttemp)
  public login(@MessageBody() userLoginInfo: IUserLoginInfo): 
    Observable<WsResponse<IResponseData<string | null, AuthErrorCode | null>>> {
    let errorCode: AuthErrorCode;
    const errorCodePartialDataMap: Map<AuthErrorCode, IPartialData> = new Map<AuthErrorCode, IPartialData>([
      [
        'NON_EXISTENT_LOGIN', 
        {
          statusCode: 400,
          message: 'Пользователь с таким логином не существует'
        }
      ],
      [
        'WRONG_PASSWORD', 
        {
          statusCode: 400,
          message: 'Неверный пароль'
        }
      ]
    ]);
    let currentUser: User;

    return this.usersService.getByQuery({ nickname: userLoginInfo.nickname })
      .pipe(
        switchMap((user: User) => {
          if (!user) {
            errorCode = 'NON_EXISTENT_LOGIN';
            return throwError(() => new Error(`Error code: ${errorCode}, mail: ${userLoginInfo.nickname}`)); 
          }
          currentUser = user;

          return this.hashService.isMatchPasswords(userLoginInfo.password, user.password);
        }),      
        switchMap((isMatch: boolean) => {
          if (!isMatch) {
            errorCode = 'WRONG_PASSWORD';
            return throwError(() => new Error(`Error code: ${errorCode}, password: ${userLoginInfo.password}`)); 
          }
          const token: string = this.jwtService.sign({
            userId: currentUser.id,
            nickname: currentUser.nickname,
            role: currentUser.role
          }, {
            expiresIn: '100y',
            secret: secretKey
          });
          
          return of({
            event: AuthEvents.LoginSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: `Bearer ${token}`,
              message: 'Вход успешно произведен'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'AuthGateway');
          const partialData: IPartialData | undefined = errorCodePartialDataMap.get(errorCode);
          return of({
            event: AuthEvents.LoginFailed,
            data: {
              statusCode: partialData?.statusCode ?? 400,
              errorCode,
              isError: true,
              data: null,
              message: partialData?.message ?? 'Неизвестная ошибка'             
            }
          });
        })
      );
  }

}
