import { ConnectedSocket, MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Roles } from '../../../decorators';
import { Role, UserEvents } from '@core/enums';
import { JwtAuthGuard, RolesAuthGuard } from '../../../guards';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { IResponseData } from '@core/interfaces';
import { Product, User } from '@core/entities';
import { AuthErrorCode, DbErrorCode } from '@core/types';
import { UsersService } from '../services';
import { HashService } from '../../../services';
import { IPartialData } from '../../../models/interfaces';
import { Not } from 'typeorm';
import { Socket } from 'net';
import { JwtService } from '@nestjs/jwt';
import { secretKey } from '../../../models/constants';

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
    private readonly hashService: HashService,
    private readonly jwtService: JwtService) {}

  /**
   * Получение пользователя по id
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
    return this.usersService.getByQuery({ id }, true)
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
              message: 'Ошибка при получении пользователя'
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
          Logger.warn(`Updating user: ${affectedRows} rows`, 'UsersGateway');
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

  /**
   * Обновление связанных товаров
   * @param {string[]} productIds id товаров
   * @param {Socket} client подсоединенный клиент
   * @return {*}  {(Observable<WsResponse<IResponseData<User | null, DbErrorCode | null>>>)} пользователь с обновленными товарами
   * @memberof UsersGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(UserEvents.UpdateFavoriteProductsFailed), 
    RolesAuthGuard(UserEvents.UpdateFavoriteProductsFailed))
  @SubscribeMessage(UserEvents.UpdateFavoriteProductsAttempt)
  public updateFavoriteProducts(@MessageBody() productIds: string[], @ConnectedSocket() client: Socket): 
    Observable<WsResponse<IResponseData<User | null, DbErrorCode | null>>> {
    const token: string = client['handshake']?.auth?.token;
    const tokenWithoutBearer: string = token.split(' ')?.[1];
    const userId: string = this.jwtService.verify(tokenWithoutBearer, {
      secret: secretKey
    })?.userId;

    return this.usersService.updateFavoriteProducts(userId, productIds)
      .pipe(
        switchMap((user: User) => {
          return of({
            event: UserEvents.UpdateFavoriteProductsSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: user,
              message: 'Товар успешно добавлен в избранное'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'UsersGateway');
          return of({
            event: UserEvents.UpdateFavoriteProductsFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при добавлении товара в избранное'
            }
          });
        })
      );
  }

  /**
   * Получение избранных товаров пользователя
   * @param {string} userId id пользователя
   * @return {*}  {(Observable<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>>)} избранные товары
   * @memberof UsersGateway
   */
  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard(UserEvents.GetFavoriteProductsFailed), 
    RolesAuthGuard(UserEvents.GetFavoriteProductsFailed))
  @SubscribeMessage(UserEvents.GetFavoriteProductsAttempt)
  public getFavoriteProducts(@MessageBody() userId: string): 
    Observable<WsResponse<IResponseData<Product[] | null, DbErrorCode | null>>> {

    return this.usersService.getFavoriteProducts(userId)
      .pipe(
        switchMap((products: Product[]) => {
          return of({
            event: UserEvents.GetFavoriteProductsSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: products,
              message: 'Товары успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'UsersGateway');
          return of({
            event: UserEvents.GetFavoriteProductsFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении товаров'
            }
          });
        })
      );
  }

  /**
   * Получение всех пользователей
   * @return {*}  {(Observable<WsResponse<IResponseData<User[] | null, DbErrorCode | null>>>)} пользователи
   * @memberof UsersGateway
   */
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard(UserEvents.GetUsersFailed), RolesAuthGuard(UserEvents.GetUsersFailed))
  @SubscribeMessage(UserEvents.GetUsersAttempt)
  public getUsers(): Observable<WsResponse<IResponseData<User[] | null, DbErrorCode | null>>> {
    return this.usersService.getAll()
      .pipe(
        switchMap((users: User[]) => {
          return of({
            event: UserEvents.GetUsersSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: users,
              message: 'Пользователи успешно получены'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'UsersGateway');
          return of({
            event: UserEvents.GetUsersFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при получении пользователей'
            }
          });
        })
      );
  }

  /**
   * Удаление пользователя по id
   * @param {string} id id
   * @return {*}  {(Observable<WsResponse<IResponseData<number | null, DbErrorCode | null>>>)} кол-во затронутых записей
   * @memberof UsersGateway
   */
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard(UserEvents.DeleteUserFailed), RolesAuthGuard(UserEvents.DeleteUserFailed))
  @SubscribeMessage(UserEvents.DeleteUserAttempt)
  public deleteUser(@MessageBody() id: string): Observable<WsResponse<IResponseData<number | null, DbErrorCode | null>>> {
    return this.usersService.deleteById(id)
      .pipe(
        switchMap((affectedRows: number) => {
          Logger.warn(`Deleting user: ${affectedRows} rows`, 'UsersGateway');

          return of({
            event: UserEvents.DeleteUserSuccessed,
            data: {
              statusCode: 200,
              errorCode: null,
              isError: false,
              data: affectedRows,
              message: 'Пользователь успешно удален'
            }
          });
        }),
        catchError((e: Error) => {
          Logger.error(e, 'UsersGateway');
          return of({
            event: UserEvents.DeleteUserFailed,
            data: {
              statusCode: 500,
              errorCode: <DbErrorCode>'DB_ERROR',
              isError: false,
              data: null,
              message: 'Ошибка при удалении пользователя'
            }
          });
        })
      );
  }
}
