import re
from selenium.webdriver.remote.webelement import WebElement
from constants.url import URL
from constants.offers_per_product import OFFERS_PER_PRODUCT
from services.base_scraping import BaseScrapingService
from entities.characteristic import Characteristic
from entities.product import Product

class ProductScrapingService(BaseScrapingService):
  """ Сервис-скрепер товаров

  Args:
    BaseScrapingService (_type_): наследуется от BaseScrapingService
  """

  def __init__(self) -> None:
    pass

  def has_numbers(self, input_str: str) -> bool:
    """ Содержаться ли числа в строке

    Args:
      input_str (str): строка_

    Returns:
      bool: true / false
    """

    return any(char.isdigit() for char in input_str)
  
  def extract_number(self, input_str: str) -> float:
    """ Извлечение вещественного числа из строки

    Args:
      input_str (str): строка

    Returns:
      float: число
    """
    
    copy_str: str = input_str.replace(' ', '')
    return float(re.findall(r"[-+]?(?:\d*\.*\d+)", copy_str)[0])

  def __get_сharacteristics(self) -> list[Characteristic]:
    """ Получение характеристик

    Returns:
      list[Filter]: список характеристик
    """

    characteristics: list[Characteristic] = []
    characteristics_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.specifications:not(.active) .item')
    for characteristics_div in characteristics_divs:
      characteristic_label: str = self._execute(self._get_text_from_element, '', '.label', characteristics_div).strip()
      #Иногда в название характеристики попадает текст из подсказки, поэтому необходимо его убрать
      characteristic_label = re.sub("\\n.+", "", characteristic_label)
      characteristic_value: str = self._execute(self._get_text_from_element, '', '.value', characteristics_div).strip()

      #Первые два ветвления указывают, что тип характеристики - boolean
      if characteristic_value == 'Нет':
        characteristic: Characteristic = Characteristic(characteristic_label, False)
        characteristics.append(characteristic)
      elif characteristic_value == 'Есть':
        characteristic: Characteristic = Characteristic(characteristic_label, True)
        characteristics.append(characteristic)
      #Если в строке есть числа, необходимо их извлечь, чтобы не хранить строкой
      elif self.has_numbers(characteristic_value):
        float_value: float = self._execute(self.extract_number, 0.0, characteristic_value)
        characteristic: Characteristic = Characteristic(characteristic_label, float_value)
        characteristics.append(characteristic)
      elif len(characteristic_value) > 0:
        characteristic: Characteristic = Characteristic(characteristic_label, characteristic_value)
        characteristics.append(characteristic)

    return characteristics

  def __get_product(self, offer_div: WebElement, category_3_level_name: str, name: str, description: str, image_path: str, characteristics: list[Characteristic]) -> Product:
    """ Получение товара

    Args:
      offer_div (WebElement): элемент с предложением
      category_3_level_name (str): название категории 3 уровня
      name (str): название
      description (str): описание
      image_path (str): путь к картинке
      characteristics (list[Characteristic]): характеристики

    Returns:
      Product: товар
    """
    shop_a: WebElement = self._execute(self._get_element_by_selector, None, '.p-c-price__shop', offer_div)
    
    #Магазин может быть представлен как картинка и как текст
    shop_image: WebElement = self._execute(self._get_element_by_selector, None, 'img', shop_a)
    shop_span: WebElement = self._execute(self._get_element_by_selector, None, 'span', shop_a)

    if shop_image:
      shop_name: str = self._execute(self._get_attribute_from_prop, '', shop_image, 'title').strip()
      price_str: str = self._execute(self._get_text_from_element, '', '.main-price', offer_div)
      price: float = self._execute(self.extract_number, 0.0, price_str)
      product: Product = Product(category_3_level_name, name, description, image_path, shop_name, price, characteristics)
      return product
    elif shop_span:
      shop_name: str = self._execute(self._get_text_from_prop, '', shop_span).strip()
      price_str: str = self._execute(self._get_text_from_element, '', '.main-price', offer_div)
      price: float = self._execute(self.extract_number, 0.0, price_str)
      product: Product = Product(category_3_level_name, name, description, image_path, shop_name, price, characteristics)
      return product

    return Product('', '', '', '', '', 0.0, [])
    
  def __get_description(self) -> str:
    """ Получение описания

    Returns:
      str: описание
    """
    more_button: WebElement = self._execute(self._get_element_by_selector, None, '.more:not(.link)')
    self._click(more_button)
    self._wait(2)

    description_blocks: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.description .block')
    for description_block in description_blocks:
      title: str = self._execute(self._get_text_from_element, '', '.title', description_block).strip()
      #Кол-во блоков может быть разным, поэтому для описания приходиться ориентироваться на заголовок блока
      if title == 'Описание от магазина':
        description: str = self._execute(self._get_text_from_element, '', '.text', description_block).strip()

        close_icon: WebElement = self._execute(self._get_element_by_selector, None, 'svg.icon-close')
        self._click(close_icon)
        self._wait(1)
        return description

    close_icon: WebElement = self._execute(self._get_element_by_selector, None, 'svg.icon-close')
    self._click(close_icon)
    self._wait(1)
    return ''

  def __get_products_by_category(self, category_3_level_name: str) -> list[Product]:
    """ Получение товаров по категории 3 уровня

    Args:
      category_3_level_name (str): название категории 3 уровня

    Returns:
      list[Product]: список товаров
    """

    products: list[Product] = []
    name: str = self._execute(self._get_text_from_element, '', '.model-main h1')
    description: str = self._execute(self.__get_description, '')
    image_path: str = self._execute(self._get_attribute_from_element, '', 'src', '.slider img')
    #Нажатие на раздел "Характеристики"
    all_characteristic_button: WebElement = self._execute(self._get_element_by_selector, None, '.more.link')
    self._click(all_characteristic_button)
    self._wait(1)

    characteristics: list[Characteristic] = self._execute(self.__get_сharacteristics, [])
    #Нажатие на "Цены"
    offers_div: WebElement = self._execute(self._get_element_by_selector, None, '.offers')
    self._click(offers_div)
    self._wait(2)
    offer_divs: list[WebElement] = self._execute(self._get_elements_by_selector, [], '.p-c-price')
    #Выбор первых 5 предложений
    offer_divs = offer_divs[:OFFERS_PER_PRODUCT]
    for offer_div in offer_divs:
      product: Product = self._execute(self.__get_product, Product('', '', '', '', '', 0, []), offer_div, category_3_level_name, name, description, image_path, characteristics)
      products.append(product)

    return products

  def __get_products(self, products_map: dict[str, list[str]]) -> list[Product]:
    """ Получение товаров

    Args:
      productsMap (dict[str, list[str]]): словарь с названиями категорий 3 уровня и ссылок на товары

    Returns:
      list[Product]: список товаров
    """

    products: list[Product] = []
    for [category_3_level_name, links] in dict.items(products_map):
      for link in links:
        self._driver.get(link)
        products_by_category: list[Product] = self._execute(self.__get_products_by_category, [], category_3_level_name)
        products.extend(products_by_category)
        #REMOVE
        if len(products) > 300:
          return products

    return products
  
  def __scrape(self, products_map: dict[str, list[str]]) -> list[Product]:
    """ Скрепинг товаров

    Args:
      productsMap (dict[str, list[str]]): словарь с названиями категорий 3 уровня и ссылок на товары

    Returns:
      list[Product]: список товаров
    """

    self._init_driver()
    self._driver.get(URL)
    self._wait(2)
    products: list[Product] = self._execute(self.__get_products, [], products_map)
    self._driver.quit()

    return products

  def scrape(self, products_map: dict[str, list[str]]) -> list[Product]:
    """ Скрепинг товаров (публичное API)

    Args:
      productsMap (dict[str, list[str]]): словарь с названиями категорий 3 уровня и ссылок на товары

    Returns:
      list[Product]: список товаров
    """

    result: list[Product] = self._execute(self.__scrape, [], products_map)
    return result


