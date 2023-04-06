import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, UsersModule, ProductsModule, CategoriesModule, ExternalModule, ShopsModule } from './modules';
import { Shop,
  Product,
  User,
  Category1Level,
  Category2Level,
  Category3Level } from '@core/entities';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppGateway } from './gateways';
import { secretKey } from './models/constants';
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
    BackupService,
    AppGateway
  ],
})
export class AppModule {}
