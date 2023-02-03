import { Injectable, CanActivate, ExecutionContext, ForbiddenException, mixin, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@core/enums';
import { secretKey, roleKey } from '../models/constants';
import { AppErrorCode } from '@core/types';

/**
 * Гвард для защиты роутов (проверяет соответствие ролей)
 * @export
 * @type { (failedEventName: string): Type<any> }
 */
export const RolesAuthGuard = (failedEventName: string): Type<any> => {
  @Injectable()
  class RolesAuthGuardMixin implements CanActivate {
    constructor(private reflector: Reflector,
      private readonly jwtService: JwtService) { }

    public canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>(roleKey, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
        return true;
      }

      const client = context.switchToWs().getClient();
      const token: string = client.handshake?.auth?.token;
      const tokenWithoutBearer: string = token.split(' ')?.[1];
      const role: Role = this.jwtService.verify(tokenWithoutBearer, {
        secret: secretKey
      })?.role;

      if (!requiredRoles.includes(role)) {
        client.emit(failedEventName, {
          statusCode: 403,
          errorCode: <AppErrorCode>'FORBIDDEN_RESOURCE',
          isError: true,
          data: null,
          message: 'Ошибка прав доступа'
        });
        return false;
      }

      return true;
    }
  }

  const guard = mixin(RolesAuthGuardMixin);
  return guard;
};
