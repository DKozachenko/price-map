from services.category_scraping import CategoryScrapingService
from services.product_scraping import ProductScrapingService
from entities.category_1_level import Category1Level
from entities.product import Product

class ScrapingService:
  """ Главный сервис-скрепер
  """

  def __init__(self) -> None:
    self.category_scraping_service: CategoryScrapingService = CategoryScrapingService()
    self.product_scraping_service: ProductScrapingService = ProductScrapingService()

  def scrape_categories(self) -> list[Category1Level]:
    """ Скрепинг категорий 1 уровня

    Returns:
      list[Category1Level]: список категорий 1 уровня (вместе со вложенными категориями 2 и 3 уровней)
    """

    return self.category_scraping_service.scrape()

  def scrape_products(self, products_map: dict[str, list[str]]) -> list[Product]:
    """ Скрепинг товаров

    Args:
      products_map (dict[str, list[str]]): словарь с названиями категорий 3 уровня и ссылок на товары
      в этих категориях

    Returns:
      list[Product]: список товаров
    """

    return self.product_scraping_service.scrape(products_map)
