import { Module } from '@nestjs/common';
import { Categories1LevelService } from './services';
import { Categories1LevelGateway } from './gateways';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category1Level, Category3Level } from '@price-map/core/entities';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([
    Category1Level,
    Category3Level
  ], 'postgresConnect')],
  providers: [
    JwtService,
    Categories1LevelGateway,
    Categories1LevelService,
  ],
  exports: [Categories1LevelService]
})
export class Categories1LevelModule {}
