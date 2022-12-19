import { UsersService } from './../../users/services/users.service';
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
import * as bcrypt from 'bcrypt';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class AuthGateway {
  constructor (private readonly usersService: UsersService) {}

  @SubscribeMessage('register attempt')
  public async register(@MessageBody() data: any): Promise<WsResponse<{ user: any } | any>> {
    const newUser = data;
    const userWithSameNickname = await this.usersService.getByNickname(newUser.nickname);
    if (userWithSameNickname) {
      return { 
        event: 'register failed', 
        data: {
          statusCode: 401,
          error: true,
          message: 'User with this nickname already exists'
        }
      }
    }

    let salt: string;
    let password: string;
    let hash: string;
    try {
      salt = await bcrypt.genSalt();
      password = newUser.password;
      hash = await bcrypt.hash(password, salt);
      //TODO: убрать
      // throw new Error();
    } catch (e) {
      return { 
        event: 'register failed', 
        data: {
          statusCode: 405,
          error: true,
          message: 'Error while hashing password occured'
        }
      }
    }

    try {
      const savedUser = this.usersService.add({
        ...newUser,
        password: hash
      })

      //TODO: убрать
      // throw new Error();
      return { 
        event: 'register successed', 
        data: {
          statusCode: 201,
          error: false,
          result: savedUser
        }
      }
    } catch (e) {
      return { 
        event: 'register failed', 
        data: {
          statusCode: 500,
          error: true,
          message: 'Error while saving in db'
        }
      }
    }    
  }

}