import { Module } from '@nestjs/common';
import { ScrapingService } from './services';

@Module({
  imports: [],
  providers: [ScrapingService],
  exports: [ScrapingService]
})
export class ScrapingModule {}
