import { JwtAuthGuard } from './../../auth/guards/jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse } from '@nestjs/websockets';
import { Category2Level, Category3Level, Category1Level } from '@price-map/core/entities';
import { Repository } from 'typeorm';
import { UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../../auth/guards';
import { AuthService } from '../../auth/services';
import { Server } from 'http';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsAuthGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private authService: AuthService) {

  }

  public afterInit(server: any) {
    console.log('INIT')
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECTED');
  }

  @UseGuards(LocalAuthGuard)
  @SubscribeMessage('login')
  public async handleMessage1(@MessageBody() data: string): Promise<WsResponse<{ token: string }>> {
    console.log(data, this.server);
    return { event: 'auth', data: await this.authService.login({}) };
  }
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('profile')
  public async handleMessage2(@MessageBody() data: string): Promise<WsResponse<{ name: string }>> {
    console.log(data);
    return { event: 'ws-auth-resp', data: { name: 'lox' } };
  }
}