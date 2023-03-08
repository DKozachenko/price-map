from services.scraping import ScrapingService
from services.rabbit import RabbitService
from services.filter import FilterService
from services.logger import LoggerService
from constants.scraper_exchange import SCRAPER_EXCHANGE
from constants.categories_routing_key import CATEGORIES_ROUTING_KEY
from constants.products_routing_key import PRODUCTS_ROUTING_KEY
from constants.products_out_routing_key import PRODUCTS_OUT_ROUTING_KEY
from entities.category_1_level import Category1Level
from entities.product import Product
from entities.product_shop_match import ProductShopMatch

class App:
  """ Класс приложения
  """

  def __init__(self) -> None:
    self.scraping_service: ScrapingService = ScrapingService()
    self.rabbit_service: RabbitService = RabbitService()
    self.filter_service: FilterService = FilterService()
    self.logger_service: LoggerService = LoggerService()

  def __get_product_shop_matches(self, products: list[Product]) -> list[ProductShopMatch]:
    """ Получение сопоставление товара и магазина

    Args:
      products (list[Product]): товары

    Returns:
      list[ProductShopMatch]: список сопоставлений
    """
    matches: list[ProductShopMatch] = []

    for product in products:
      match: ProductShopMatch = ProductShopMatch(product.id, product.shopName)
      matches.append(match)

    return matches

  def start(self) -> None:
    """ Старт приложения
    """

    is_working: bool = True
    while is_working:
      try:
        categories: list[Category1Level] = self.scraping_service.scrape_categories()
        self.logger_service.log(f'Categories were gotten, number: {len(categories)}', 'App')
        categories = self.filter_service.filter_categories_1_level(categories)

        if len(categories) > 0:
          self.rabbit_service.send_message(SCRAPER_EXCHANGE, CATEGORIES_ROUTING_KEY, categories)

        products: list[Product] = self.scraping_service.scrape_products()
        self.logger_service.log(f'Products were gotten, number: {len(products)}', 'App')
        products = self.filter_service.filter_products(products)

        if len(products) > 0:
          self.rabbit_service.send_message(SCRAPER_EXCHANGE, PRODUCTS_ROUTING_KEY, products)
          # matches: list[ProductShopMatch] = self.__get_product_shop_matches(products)
          # self.rabbit_service.send_message(SCRAPER_EXCHANGE, PRODUCTS_OUT_ROUTING_KEY, matches)
      except:
        self.logger_service.error('Error occured', 'App')
        self.logger_service.log('Application shut down', 'App')
        is_working = False


