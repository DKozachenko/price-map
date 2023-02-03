import { ExecutionContext, Injectable, UnauthorizedException, CanActivate, mixin } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { of } from 'rxjs';
import { jwtConstants } from '../models/constants';

//TODO: вынести в app
export const JwtAuthGuard = (failedEventName: string) => {
  @Injectable()
  class JwtAuthGuardMixin implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    public canActivate(context: ExecutionContext): boolean {
      const client = context.switchToWs().getClient();
      const data = context.switchToWs().getData();
      console.log(123, data);
      console.log(client.handshake)
      // console.log(client.handshake.headers)
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
          secret: jwtConstants.secret
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
