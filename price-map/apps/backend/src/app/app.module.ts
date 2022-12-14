import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './controllers/cats.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { WsModule, ScrapingModule } from './modules';
import { CategoryScrapingService, ProductScrapingService, ScrapingService } from './modules/scraping/services';
import { Organization, 
  Shop, 
  Product, 
  User, 
  Category1Level,
  Category2Level,
  Category3Level } from '@price-map/core/entities';
import * as fs from 'fs';

//TODO: вынести в интерфейсы
interface BreadcrumbInfo {
  [key: string]: string,
  category1LevelName: string,
  category2LevelName: string,
  category3LevelName: string,
}


@Module({
  imports: [
    WsModule,
    ScrapingModule,
    //TODO: Добавить свой логгер
    //TODO: Миграции
    TypeOrmModule.forRoot({
      name: 'postgresConnect',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'vkdima03',
      database: 'master_pm',
      entities: [
        Organization, 
        Shop, 
        Product, 
        User, 
        Category1Level, 
        Category2Level, 
        Category3Level
      ],
      synchronize: true,
    })
  ],
  controllers: [
    AppController, 
    CatsController
  ],
  providers: [
    AppService, 
    CatsService
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly scrapingService: ScrapingService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
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
