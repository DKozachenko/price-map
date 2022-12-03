import { MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './controllers/cats.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { BaseEntity } from './models/test.entity';
import { WsModule, ScrapingModule } from './modules';
import { ScrapingService } from './modules/scraping/services';
let fs = require('fs');

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
  constructor(private readonly scrapingService: ScrapingService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }

  public async onModuleInit(): Promise<void> {
    console.time();
    const result = await this.scrapingService.scrapeCategories1Level();
    // fs.writeFile('test.json', JSON.stringify(result), function(error){
    //   if(error) throw error;
    // });
    console.timeEnd();
    // console.log(result)
  }
}
