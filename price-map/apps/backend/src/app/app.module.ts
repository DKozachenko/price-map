import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './controllers/cats.controller';
import { CatsService } from './controllers/cats.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { 
  Organization, 
  Shop, 
  Product, 
  User, 
  Category1Level,
  Category2Level,
  Category3Level } from '@price-map/core/entities';
import { WsModule } from './modules/ws/ws.module';

@Module({
  imports: [
    WsModule,
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
      entities: [Organization, Shop, Product, User, Category1Level, Category2Level, Category3Level],
      synchronize: true,
    })
  ],
  controllers: [AppController, CatsController],
  providers: [AppService, CatsService],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
