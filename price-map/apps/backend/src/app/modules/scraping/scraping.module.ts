import { Module } from '@nestjs/common';
import { ScrapingService, ProductScrapingService } from './services';

@Module({
  imports: [],
  providers: [ScrapingService, ProductScrapingService],
  exports: [ScrapingService, ProductScrapingService]
})
export class ScrapingModule {}
