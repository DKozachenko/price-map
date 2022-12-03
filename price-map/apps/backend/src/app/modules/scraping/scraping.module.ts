import { Module } from '@nestjs/common';
import { CategoryScrapingService, ScrapingService, ProductScrapingService } from './services';

@Module({
  imports: [],
  providers: [CategoryScrapingService, ProductScrapingService, ScrapingService],
  exports: [ScrapingService]
})
export class ScrapingModule {}
