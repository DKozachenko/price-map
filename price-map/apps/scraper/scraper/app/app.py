from services.scraping import ScrapingService
from services.rabbit import RabbitService
from constants.scraper_exchange import SCRAPER_EXCHANGE
from constants.categories_routing_key import CATEGORIES_ROUTING_KEY
from constants.products_routing_key import PRODUCTS_ROUTING_KEY
from entities.category_1_level import Category1Level
from entities.product import Product

class App:
  """ Класс приложения
  """

  def __init__(self) -> None:
    self.scraping_service: ScrapingService = ScrapingService()
    self.rabbit_service: RabbitService = RabbitService()

  def start(self) -> None:
    """ Старт приложения
    """

    # while True:
    for i in range(1):
      categories: list[Category1Level] = self.scraping_service.scrape_categories()

      # if len(categories) > 0:
        # self.rabbit_service.send_message(SCRAPER_EXCHANGE, CATEGORIES_ROUTING_KEY, categories)
      products: list[Product] = self.scraping_service.scrape_products()
      self.rabbit_service.send_message(SCRAPER_EXCHANGE, PRODUCTS_ROUTING_KEY, products)
