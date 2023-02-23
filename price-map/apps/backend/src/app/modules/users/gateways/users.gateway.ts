import { MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { Role, UserEvents } from '@core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { IResponseData, IUserRegisterInfo } from '@core/interfaces';
import { User } from '@core/entities';
import { AuthErrorCode, DbErrorCode } from '@core/types';
import { UsersService } from '../services';
import { HashService } from '../../../services';
import { IPartialData } from '../../../models/interfaces';
import { Not } from 'typeorm';

/**
 * Шлюз пользователей
 * @export
 * @class UsersGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class UsersGateway {
  constructor (private readonly usersService: UsersService,
    private readonly hashService: HashService) {}

  /**
   * Получение ползователя по id
   * @param {string} id id
   * @return {*}  {(Observable<WsResponse<IResponseData<User | null, DbErrorCode | null>>>)} пользователь
   * @memberof UsersGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(UserEvents.GetUserFailed), 
    RolesAuthGuard(UserEvents.GetUserFailed))
  @SubscribeMessage(UserEvents.GetUserAttempt)
  public getUserById(@MessageBody() id: string): 
    Observable<WsResponse<IResponseData<User | null, DbErrorCode | null>>> {
    return this.usersService.getByQuery({ id })
      .pipe(
        switchMap((user: User) => {
          return of({
            event: UserEvents.GetUserSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: user,
              message: 'Пользователь успешно получен'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'UsersGateway');
          return of({
            event: UserEvents.GetUserFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получения пользователя'
            }
          });
        })
      );
  }

  /**
   * Обновление пользователя
   * @param {User} user пользователь
   * @return {*}  {(Observable<WsResponse<IResponseData<Partial<User> | null, AuthErrorCode | null>>>)} пользователь (поле пароль - опционально)
   * @memberof UsersGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(UserEvents.UpdateUserFailed), 
    RolesAuthGuard(UserEvents.UpdateUserFailed))
  @SubscribeMessage(UserEvents.UpdateUserAttempt)
  public updateUser(@MessageBody() user: User): 
    Observable<WsResponse<IResponseData<Partial<User> | null, AuthErrorCode | null>>> {
    
    let updateInfo: Partial<User>;
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
          message: 'Ошибка при обновлении пользователя'
        }
      ],
      [
        'DB_ERROR', 
        {
          statusCode: 500,
          message: 'Ошибка при обновлении пользователя'
        }
      ]
    ]);

    return this.usersService.getByQuery({ nickname: user.nickname, id: Not(user.id) })
      .pipe(
        switchMap((userWithSameNickname: User | null) => {
          if (userWithSameNickname) {
            errorCode = 'EXISTED_NICKNAME';
            return throwError(() => new Error(`Error code: ${errorCode}, nickname: ${user.nickname}`));
          }

          updateInfo = {
            ...updateInfo,
            nickname: user.nickname
          };
          return this.usersService.getByQuery({ mail: user.mail, id: Not(user.id) });
        }),
        switchMap((userWithSameMail: User | null) => {
          if (userWithSameMail) {
            errorCode = 'EXISTED_MAIL';
            return throwError(() => new Error(`Error code: ${errorCode}, mail: ${user.mail}`)); 
          }

          updateInfo = {
            ...updateInfo,
            mail: user.mail
          };

          //Если с фронта пришел пароль, значит, он измененный, его нужно захешировать и обновить
          if (user.password) {
            return this.hashService.hashPassword(user.password)
              .pipe(
                catchError((e: Error) => {
                  errorCode = 'HASH_ERROR';
                  return throwError(() => new Error(`Error code: ${errorCode}, error: ${e}`)); 
                }),
              );
          }
          //Если фронт ничего не прислал, значит, пароль менять не надо
          return of(null);
        }),
        switchMap((hashedPassword: string | null) => {
          if (hashedPassword) {
            updateInfo = {
              ...updateInfo,
              password: hashedPassword
            };
          }
          
          updateInfo = {
            ...updateInfo,
            name: user.name,
            lastName: user.lastName,
          };

          return this.usersService.updateById(user.id, updateInfo)
            .pipe(
              catchError((e: Error) => {
                errorCode = 'DB_ERROR';
                return throwError(() => new Error(`Error code: ${errorCode}, error: ${e}`)); 
              }),
            );
        }),
        switchMap((affectedRows: number) => {
          Logger.log(`Updating user: ${affectedRows} rows`, 'UsersGateway');
          return of({
            event: UserEvents.UpdateUserSuccessed,
            data: {
              statusCode: 201,
              errorCode: null,
              isError: false,
              data: {
                ...user,
                ...updateInfo
              },
              message: 'Пользователь успешно обновлен'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'UsersGateway');
          const partialData: IPartialData | undefined = errorCodePartialDataMap.get(errorCode);
          return of({
            event: UserEvents.UpdateUserFailed,
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
