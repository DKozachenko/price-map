class Config:
  """ Конфигурационный класс
  """
  
  def __init__(self) -> None:
    self.url: str = 'https://novosibirsk.price.ru/'
    """ Адрес сайта """
    self.categories_routing_key: str = 'categories'
    """ Ключ маршрутизации для категорий """
    self.offers_per_product: int = 5
    """ Количество получаемых для товара предложений """
    self.products_out_routing_key: str = 'products_out'
    """ Ключ маршрутизации для товаров (получение координат) """
    self.products_per_category: int = 5
    """ Количество получаемых для категории товаров """
    self.products_routing_key: str = 'products'
    """ Ключ маршрутизации для товаров """
    self.scraper_exchange: str = 'scraper_exchange'
    """ Название обменника """