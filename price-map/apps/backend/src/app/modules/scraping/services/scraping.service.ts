import { Injectable } from "@nestjs/common";
import { CategoryScrapingService, ProductScrapingService } from ".";

interface BreadcrumbInfo {
  [key: string]: string,
  category1LevelName: string,
  category2LevelName: string,
  category3LevelName: string,
}

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
} 