from services.category_scraping import CategoryScrapingService
from services.product_scraping import ProductScrapingService
from entities.category_1_level import Category1Level
from entities.product import Product

class ScrapingService:
  """ Главный сервис-скрепер
  """

  def __init__(self) -> None:
    self.category_scraping_service: CategoryScrapingService = CategoryScrapingService()
    """ Сервис-скрепер категорий """
    self.product_scraping_service: ProductScrapingService = ProductScrapingService()
    """ Сервис-скрепер товаров """

  def scrape_categories(self) -> list[Category1Level]:
    """ Скрепинг категорий 1 уровня

    Returns:
      list[Category1Level]: список категорий 1 уровня (вместе со вложенными категориями 2 и 3 уровней)
    """

    return self.category_scraping_service.scrape()

  def scrape_products(self) -> list[Product]:
    """ Скрепинг товаров

    Returns:
      list[Product]: список товаров
    """
    
    products_map: dict[str, list[str]] = self.category_scraping_service.products_map
    return self.product_scraping_service.scrape(products_map)
