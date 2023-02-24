from typing import Any
from services.category_scraping import CategoryScrapingService
from services.product_scraping import ProductScrapingService

class ScrapingService:
  def __init__(self) -> None:
    self.category_scraping_service: CategoryScrapingService = CategoryScrapingService()
    self.product_scraping_service: ProductScrapingService = ProductScrapingService()

  def scrape_categories(self) -> list[Any]:
    return self.category_scraping_service.scrape()

  def scrape_products(self, products_map: dict[str, list[str]]) -> list[Any]:
    return self.product_scraping_service.scrape(products_map)