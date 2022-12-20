import { ExecutionContext, Injectable, CanActivate, mixin } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstant } from '../constants';

export const JwtAuthGuard = (failedEventName: string) => {
  @Injectable()
  class JwtAuthGuardMixin implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    public canActivate(context: ExecutionContext): boolean {
      const client = context.switchToWs().getClient();
      const token: string = client.handshake?.auth?.token;

      if (!token) {
        client.emit(failedEventName, {
          statusCode: 401,
          error: true,
          message: 'Unauthorized'
        });
        return false;
      }

      const tokenWithoutBearer: string = token.split(' ')?.[1];

      let payload: any;
      try {
        payload = this.jwtService.verify(tokenWithoutBearer, {
          secret: jwtConstant.secret
        });
      } catch (e) {
        client.emit(failedEventName, {
          statusCode: 408,
          error: true,
          message: 'Not verified token'
        });
        return false;
      }

      return true;
    }
  }

  const guard = mixin(JwtAuthGuardMixin);
  return guard;
};
