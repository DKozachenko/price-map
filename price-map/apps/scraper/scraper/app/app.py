from app.config import Config
from services.scraping import ScrapingService
from services.rabbit import RabbitService
from services.filter import FilterService
from services.logger import LoggerService
from entities.category_1_level import Category1Level
from entities.product import Product
from entities.product_shop_match import ProductShopMatch

class App:
  """ Класс приложения
  """

  def __init__(self) -> None:
    self.config: Config = Config()
    """ Конфиг """
    self.scraping_service: ScrapingService = ScrapingService()
    """ Главный сервис-скрепер """
    self.rabbit_service: RabbitService = RabbitService()
    """ Сервис для взаимодействия с Rabbit """
    self.filter_service: FilterService = FilterService()
    """ Сервис фильтрации """
    self.logger_service: LoggerService = LoggerService()
    """ Логер """

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
    self.logger_service.log('Application start', 'App')

    is_working: bool = True
    while is_working:
      try:
        categories: list[Category1Level] = self.scraping_service.scrape_categories()
        self.logger_service.log(f'Categories were gotten, number: {len(categories)}', 'App')
        categories = self.filter_service.filter_categories_1_level(categories)

        if len(categories) > 0:
          self.rabbit_service.send_message(self.config.scraper_exchange, self.config.categories_routing_key, categories)

        products: list[Product] = self.scraping_service.scrape_products()
        self.logger_service.log(f'Products were gotten, number: {len(products)}', 'App')
        products = self.filter_service.filter_products(products)

        if len(products) > 0:
          self.rabbit_service.send_message(self.config.scraper_exchange, self.config.products_routing_key, products)
          matches: list[ProductShopMatch] = self.__get_product_shop_matches(products)
          self.rabbit_service.send_message(self.config.scraper_exchange, self.config.products_out_routing_key, matches)
       
      except Exception as err:
        self.logger_service.error(f'Error occured: {str(err)}', 'App')
        self.logger_service.log('Application shut down', 'App')
        is_working = False


