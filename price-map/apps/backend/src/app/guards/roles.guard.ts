import { Injectable, CanActivate, ExecutionContext, ForbiddenException, mixin } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@core/enums';
import { secretKey, roleKey } from '../constants';

/**
 * Гвард для защиты роутов (проверяет соответствие ролей)
 * @export
 * @type { (failedEventName: string): Type<any> }
 */
export const RolesAuthGuard = (failedEventName: string): any => {
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
      const token: Role = client.handshake?.auth?.token;
      const tokenWithoutBearer: string = token.split(' ')?.[1];
      const role = this.jwtService.verify(tokenWithoutBearer, {
        secret: secretKey
      })?.role;

      if (!requiredRoles.includes(role)) {
        client.emit(failedEventName, {
          statusCode: 403,
          error: true,
          message: 'Forbidden'
        });
        return false;
      }

      return true;
    }
  }

  const guard = mixin(RolesAuthGuardMixin);
  return guard;
};
