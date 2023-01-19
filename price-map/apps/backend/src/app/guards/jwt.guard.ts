import { ExecutionContext, Injectable, CanActivate, mixin, Type } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { secretKey } from '../constants';
import { IPayload } from '@price-map/core/interfaces';

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
      console.log(client.handshake)
      const token: string = client.handshake?.auth?.token;

      if (!token) {
        client.emit(failedEventName, {
          statusCode: 401,
          error: true,
          message: 'Неавторизированный пользователь'
        });
        return false;
      }

      const tokenWithoutBearer: string = token.split(' ')?.[1];

      let payload: IPayload;
      try {
        payload = this.jwtService.verify(tokenWithoutBearer, {
          secret: secretKey
        });
      } catch (e) {
        client.emit(failedEventName, {
          statusCode: 408,
          error: true,
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
