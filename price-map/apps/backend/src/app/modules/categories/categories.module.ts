import { Module } from '@nestjs/common';
import { CategoriesService } from './services';
import { CategoriesGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category1Level, Category2Level, Category3Level } from '@core/entities';
import { JwtService } from '@nestjs/jwt';

/**
 * Модуль категорий (всех уровней)
 * @export
 * @class CategoriesModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([
    Category1Level,
    Category2Level,
    Category3Level
  ], 'postgresConnect')],
  providers: [
    JwtService,
    CategoriesGateway,
    CategoriesService,
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
