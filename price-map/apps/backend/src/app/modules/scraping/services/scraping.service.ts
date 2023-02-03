import { Injectable } from '@nestjs/common';
import { CategoryScrapingService, ProductScrapingService } from '.';
import { BreadcrumbInfo } from '../models/interfaces';

@Injectable()
export class ScrapingService {
  constructor(private readonly categoryScrapingService: CategoryScrapingService,
    private readonly productScrapingService: ProductScrapingService) {  }

  public async scrapeCategories(): Promise<any> {
    return this.categoryScrapingService.scrape();
  }

  public async scrapeProducts(productsMap: Map<BreadcrumbInfo, string[]>): Promise<any> {
    return this.productScrapingService.scrape(productsMap);
  }

  public getProductsMap(): Map<BreadcrumbInfo, string[]> {
    return this.categoryScrapingService.productsMap;
  }
} 