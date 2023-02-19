import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScrapingModule, AuthModule, UsersModule, ProductsModule, CategoriesModule, ExternalModule, ShopsModule } from './modules';
import { ScrapingService } from './modules/scraping/services';
import { Organization,
  Shop,
  Product,
  User,
  Category1Level,
  Category2Level,
  Category3Level } from '@core/entities';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppGateway } from './gateways';
import { secretKey } from './models/constants';
import { HashService, RabbitService } from './services';

/**
 * Главный модуль приложения
 * @export
 * @class AppModule
 * @implements {OnModuleInit}
 */
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    ScrapingModule,
    ExternalModule,
    ShopsModule,
    //TODO: Добавить свой логгер
    //TODO: Миграции
    TypeOrmModule.forRoot({
      name: 'postgresConnect',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'vkdima03',
      database: 'test_pm',
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
    }),
    JwtModule.register({
      secret: secretKey,
      signOptions: { expiresIn: '10h' },
    }),
  ],
  providers: [
    JwtService,
    HashService,
    RabbitService,
    AppGateway
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly scrapingService: ScrapingService,
   private readonly rabbitService: RabbitService) {}

  public async onModuleInit(): Promise<void> {
    this.rabbitService.initConnection();
    // console.time();
    // const resultCats = await this.scrapingService.scrapeCategories();
    // const productsMap: Map<BreadcrumbInfo, string[]> = this.scrapingService.getProductsMap();
    // await new Promise(temp => setTimeout(temp, 2000));
    // const result = await this.scrapingService.scrapeProducts(productsMap);
    // console.log('result', result);

    // fs.writeFile('test.json', JSON.stringify(result), function(error){
    //   if(error) throw error;
    // });
    // console.timeEnd();
  }
}
