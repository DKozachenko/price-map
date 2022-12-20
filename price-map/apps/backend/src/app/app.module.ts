import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './controllers/cats.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { WsModule, ScrapingModule, AuthModule, UsersModule } from './modules';
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
    ScrapingModule,
    //TODO: Добавить свой логгер
    //TODO: Миграции
    // TypeOrmModule.forRoot({
    //   name: 'postgresConnect',
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: 'vkdima03',
    //   database: 'master_pm',
    //   entities: [
    //     Organization,
    //     Shop,
    //     Product,
    //     User,
    //     Category1Level,
    //     Category2Level,
    //     Category3Level
    //   ],
    //   synchronize: true,
    // })
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
    JwtService
  ],
})
export class AppModule implements OnGatewayInit, OnGatewayConnection, OnModuleInit {
  public afterInit(server: any) {
    console.log('Socket INIT')
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Socket CONNECTED');
  }

  public async onModuleInit(): Promise<void> {
    console.time();
    // const resultCats = await this.scrapingService.scrapeCategories();
    // const productsMap: Map<BreadcrumbInfo, string[]> = this.scrapingService.getProductsMap();
    // await new Promise(temp => setTimeout(temp, 2000));
    // const result = await this.scrapingService.scrapeProducts(productsMap);
    // console.log('result', result)

    // fs.writeFile('test.json', JSON.stringify(result), function(error){
    //   if(error) throw error;
    // });
    console.timeEnd();
  }
}
