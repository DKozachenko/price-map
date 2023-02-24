from services.scraping import ScrapingService
from services.rabbit import RabbitService
from models.scraper_exchange import SCRAPER_EXCHANGE
from models.categories_routing_key import CATEGORIES_ROUTING_KEY

class App:
  def __init__(self):
    self.scraping_service = ScrapingService()
    self.rabbit_service = RabbitService()

  def start(self):
    self.rabbit_service.init_connection()

    # while True:
    for i in range(1):
      # categories = self.scraping_service.scrape_categories()
      categories = {
        "name": 'test name 3',
        "categories2Level": [
          {
            "name": 'test cat 2',
            "categories3Level": [
              {
                "name": 'mega 4',
                "filters": []
              }
            ]
          }
        ]
      }
      self.rabbit_service.send_message(SCRAPER_EXCHANGE, CATEGORIES_ROUTING_KEY, categories)
      print('Send message to {0}, data: {1}'.format(CATEGORIES_ROUTING_KEY, categories))

