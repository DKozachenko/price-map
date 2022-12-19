import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './controllers/cats.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { WsModule, ScrapingModule, AuthModule, UsersModule, WsAuthModule } from './modules';
import { CategoryScrapingService, ProductScrapingService, ScrapingService } from './modules/scraping/services';
import { Organization,
  Shop,
  Product,
  User,
  Category1Level,
  Category2Level,
  Category3Level } from '@price-map/core/entities';
import * as fs from 'fs';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './modules/auth/guards';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';

//TODO: вынести в интерфейсы
interface BreadcrumbInfo {
  [key: string]: string,
  category1LevelName: string,
  category2LevelName: string,
  category3LevelName: string,
}


@Module({
  imports: [
    AuthModule,
    UsersModule,
    WsAuthModule
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    JwtService
  ],
})
export class AppModule implements OnGatewayInit, OnGatewayConnection {
  public afterInit(server: any) {
    console.log('Socket INIT')
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Socket CONNECTED');
  }
}
