import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UsersModule, ProductsModule, CategoriesModule, ShopsModule } from './modules';
import { Shop,
  Product,
  User,
  Category1Level,
  Category2Level,
  Category3Level } from '@core/entities';
import { AppGateway } from './gateways';
import { BackupService, HashService, RabbitService } from './services';

/**
 * Главный модуль приложения
 * @export
 * @class AppModule
 */
@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    ShopsModule,
    TypeOrmModule.forRoot({
      name: 'postgresConnect',
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'vkdima03',
      database: 'real_data_pm',
      entities: [
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
  providers: [
    HashService,
    RabbitService,
    BackupService,
    AppGateway
  ],
})
export class AppModule {}
