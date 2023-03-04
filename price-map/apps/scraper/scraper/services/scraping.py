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

  def scrape_products(self) -> list[Product]:
    # products_map: dict[str, list[str]] = self.category_scraping_service.products_map
    products_map: dict[str, list[str]] = {
      "Apple": ['https://novosibirsk.price.ru/igrovye-pristavki/sony-playstation-5/']
    }
    return self.product_scraping_service.scrape(products_map)
