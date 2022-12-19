import { ExecutionContext, Injectable, UnauthorizedException, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { of } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtServvice: JwtService) { }

  public canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    console.log(client.handshake.auth)
    const token: string = client.handshake?.auth?.token;
    console.log(token)
    if (!token) {
      throw new WsException({
        statusCode: 401,
        error: true,
        message: 'Unauthorized'
      })
    }

    let decodeToken;
    try {
      decodeToken = this.jwtServvice.verify(token);
    } catch (e) {
      client.emit('ws-auth-resp', {data: 'error'});
      return false;
    }
    

    console.log(decodeToken)
    if (!decodeToken) {
      throw new WsException({
        statusCode: 403,
        error: true,
        message: 'Wrong token'
      })
    }
    // console.log(this.jwtServ.sign({
    //   name: 'trash',
    // }))
    // const cookies: string[] = client.handshake.headers.cookie.split('; ');
    // const authToken = cookies.find(cookie => cookie.startsWith('jwt')).split('=')[1];
    // const jwtPayload: JwtPayload = <JwtPayload> this.jwtServ.verify(authToken);
    // const user: User = await this.authService.validateUser(jwtPayload);
    // context.switchToWs().getData().user = user;
    // return Boolean(user);
    console.log(client.handshake);
    return true;
  }
}
