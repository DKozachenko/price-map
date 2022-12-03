import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './controllers/cats.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { BaseEntity } from './models/test.entity';
import { WsModule, ScrapingModule } from './modules';
import { ScrapingService, ProductScrapingService } from './modules/scraping/services';
import * as fs from 'fs';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'vkdima03',
      database: 'testDb',
      entities: [BaseEntity],
      synchronize: true
    })
  ],
  controllers: [AppController, CatsController],
  providers: [AppService, CatsService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly scrapingService: ScrapingService,
              private readonly productScrapingService: ProductScrapingService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }

  public async onModuleInit(): Promise<void> {
    console.time();
    // const result = await this.scrapingService.scrapeCategories1Level();
    const result = await this.productScrapingService.scrapeProducts(new Map<BreadcrumbInfo, string[]>([
      [{
        category1LevelName: 'Электроника',
        category2LevelName: 'Смартфоны и гаджеты',
        category3LevelName: 'Смартфоны',
      }, ['https://market.yandex.ru/product--smartfon-apple-iphone-13/1414986413?glfilter=14871214%3A25787190_101446177750&glfilter=23476910%3A26684950_101446177750&glfilter=24938610%3A41821218_101446177750&glfilter=25879492%3A25879630_101446177750&cpc=q11X4-HgA60Qv29cX4EhpfDvMsxmUDMrAT1wq-DBjpLe86-DoPR1vRbecEPzge1r5YlMzPEMnxuSkjFJM9lAQMXWpmY31lxMsblLEyYBlLlFCuXwjTgK6_kWlbEV4bOG2tejqX7EJ0gqKxWlDTwRxJECg6eb8wPTH1WDKLInXZw%2C&sku=101446177750&do-waremd5=SCeDVKKP3js2-1_hg8n0vQ&resale_goods=resale_new&cpa=1&nid=26893750']],
      
    ]));
    console.log('result', result)
    // fs.writeFile('test.json', JSON.stringify(result), function(error){
    //   if(error) throw error;
    // });
    console.timeEnd();
    // console.log(result)
  }
}
