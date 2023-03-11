import { Module } from '@nestjs/common';
import { ProductsService } from './services';
import { ProductsGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { JwtService } from '@nestjs/jwt';
import { CategoriesModule } from './../categories/categories.module';
import { ShopsModule } from '../shops/shops.module';

/**
 * Модуль товаров
 * @export
 * @class ProductsModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product], 'postgresConnect'),
    CategoriesModule,
    ShopsModule
  ],
  providers: [
    JwtService,
    ProductsGateway,
    ProductsService
  ]
})
export class ProductsModule {}
