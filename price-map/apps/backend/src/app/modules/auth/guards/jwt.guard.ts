import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException({
        error: true,
        message: 'Unauthorized',
        statusCode: 401,
      });
    }
    return user;
  }
}
