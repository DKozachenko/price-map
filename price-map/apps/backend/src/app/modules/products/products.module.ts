import { CategoriesModule } from './../categories/categories.module';
import { Module } from '@nestjs/common';
import { ProductsService } from './services';
import { ProductsGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category3Level, Product } from '@core/entities';
import { JwtService } from '@nestjs/jwt';
import { RabbitService } from '../../services';

/**
 * Модуль товаров
 * @export
 * @class ProductsModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Product], 'postgresConnect'),
    CategoriesModule
  ],
  providers: [
    JwtService,
    ProductsGateway,
    ProductsService,
  ]
})
export class ProductsModule {}
