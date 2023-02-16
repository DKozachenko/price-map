
from services.category_scraping import CategoryScrapingService
from services.product_scraping import ProductScrapingService


class ScrapingService:
  def __init__(self):
    self.category_scraping_service = CategoryScrapingService()
    self.product_scraping_service = ProductScrapingService()

  def scrape_categories():
    return self.category_scraping_service.scrape()

  def scrape_products(products_map):
    return self.product_scraping_service.scrape(products_map)