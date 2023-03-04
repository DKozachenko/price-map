from services.scraping import ScrapingService
from services.rabbit import RabbitService
from constants.scraper_exchange import SCRAPER_EXCHANGE
from constants.categories_routing_key import CATEGORIES_ROUTING_KEY
from entities.category_1_level import Category1Level
from entities.category_2_level import Category2Level
from entities.category_3_level import Category3Level
from entities.filter import Filter

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
      # filters: list[Filter] = [
      #   Filter('test filter', 'enum', ['test value 1', 'test value 2', 'test value 3']),
      #   Filter('test filter 2', 'boolean'),
      #   Filter('test filter 3', 'range', [1.34, 5.6]),
      # ]
      # cat3: Category3Level = Category3Level('test category 3 level', filters)
      # cat2: Category2Level = Category2Level('test category 2 level', [cat3])
      # cat1: Category1Level = Category1Level('test category 1 level', [cat2])
      # categories: list[Category1Level] = [cat1]
      self.rabbit_service.send_message(SCRAPER_EXCHANGE, CATEGORIES_ROUTING_KEY, categories)
