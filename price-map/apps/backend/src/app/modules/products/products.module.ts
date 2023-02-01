import { Module } from '@nestjs/common';
import { ProductsService } from './services';
import { ProductsGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Product], 'postgresConnect')],
  providers: [
    JwtService,
    ProductsGateway,
    ProductsService,
  ],
  exports: [ProductsService]
})
export class ProductsModule {}
