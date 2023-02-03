import { ExecutionContext, Injectable, CanActivate, mixin, Type, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IPayload } from '@core/interfaces';
import { secretKey } from '../models/constants';
import { AppErrorCode } from '@core/types';

/**
 * Гвард для защиты роутов (проверяет наличие токена)
 * @export
 * @type { (failedEventName: string): Type<any> }
 */
export const JwtAuthGuard = (failedEventName: string): Type<any> => {
  @Injectable()
  class JwtAuthGuardMixin implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    public canActivate(context: ExecutionContext): boolean {
      const client = context.switchToWs().getClient();
      console.log(client.handshake);
      const token: string = client.handshake?.auth?.token;

      if (!token) {
        client.emit(failedEventName, {
          statusCode: 401,
          errorCode: <AppErrorCode>'NO_TOKEN',
          isError: true,
          data: null,
          message: 'Отсутствует токен'
        });
        return false;
      }

      const tokenWithoutBearer: string = token.split(' ')?.[1];
      console.log(tokenWithoutBearer)
      let payload: IPayload;
      try {
        payload = this.jwtService.verify(tokenWithoutBearer, {
          secret: secretKey
        });
      } catch (e: any) {
        Logger.error(e, 'JwtAuthGuard');
        client.emit(failedEventName, {
          statusCode: 406,
          errorCode: <AppErrorCode>'INVALID_TOKEN',
          isError: true,
          data: null,
          message: 'Невалидный токен'
        });
        return false;
      }

      return true;
    }
  }

  const guard = mixin(JwtAuthGuardMixin);
  return guard;
};
