from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from constants.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from constants.url import URL
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

  def __get_сharacteristics(self) -> list[Characteristic]:
    """ Получение характеристик

    Returns:
      list[Filter]: список характеристик
    """

    characteristics: list[Characteristic] = []
    characteristics_dls: list[WebElement] = self._execute(self._execute_elements_by_selector, [], 'dl[id]')
    for characteristics_dl in characteristics_dls:
      dt_text: str = self._execute(self._execute_text_from_element, '', 'dt', characteristics_dl)
      dd_text: str = self._execute(self._execute_text_from_element, '', 'dd', characteristics_dl)

      value: int | float = 0

      value_float: float = float(dd_text)
      value_int: int = int(dd_text)

      if value_float is not None and len(str(value_float)) == len(dd_text):
        value = value_float
      elif value_int is not None and len(str(value_int)) == len(dd_text):
        value = value_int
      else:
        value = dd_text

      characteristic: Characteristic = Characteristic(dt_text, value)
      characteristics.append(characteristic)

    return characteristics

  def __get_product(self, offer_div: WebElement, category_3_level_name: str, name: str, description: str, characteristics: list[Characteristic], image_path: str) -> Product:
    """ Получение продукта

    Args:
      offer_div (WebElement): элемент с предложением
      category_3_level_name (str): название категории 3 уровня
      name (str): название
      description (str): описание
      characteristics (list[Characteristic]): список характеристик
      image_path (str): путь к изображению

    Returns:
      Product: товар
    """

    #TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    offer_links_a: list[WebElement] = self._execute(self._execute_elements_by_selector, [], 'a[data-zone-name="offerLink"]', offer_div)
    shop_name: str = offer_links_a[1].text

    price: str = self._execute(self._execute_text_from_element, '', 'span[data-auto="mainPrice"] span', offer_div)
    price_int: int = int(price.replace(' ', ''))

    product: Product = Product(category_3_level_name, name, description, image_path, shop_name, price_int, characteristics)
    return product


  def __get_products_by_category(self, category_3_level_name: str) -> list[Product]:
    """ Получение товаров по категории 3 уровня

    Args:
      category_3_level_name (str): название категории 3 уровня

    Returns:
      list[Product]: список товаров
    """

    products: list[Product] = []

    product_actions_a: list[WebElement] = self._execute(self._execute_elements_by_selector, [], 'div[data-baobab-name="$productActions"] a')

    self._set_cookies()
    #нажатие на раздел "Характеристики"
    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(product_actions_a[1]).click(product_actions_a[1]).perform()

    product_name: str = self._execute(self._execute_text_from_element, '', 'h1[data-baobab-name="$name"]')
    product_description: str = self._execute(self._execute_text_from_element, '', 'div[data-auto="product-full-specs"] div:not([class])')

    product_image_path: str = self._execute(self._execute_attribute_from_element, '', 'src', 'div[data-zone-name="picture"] img')

    characteristics: list[Characteristic] = self._execute(self.__get_сharacteristics, [])
    #TODO: вариант, что может не быть офферов, или вариант,
    #что нет кнопки показать предложения, тк предложений в целом немного
    all_offers_a: WebElement = self._execute(self._execute_element_by_selector, WebElement(), 'div[data-auto="topOffers"] > div > div > a')
    self._set_cookies()
    #нажатие на "Все предложения"
    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(all_offers_a).click(all_offers_a).perform()
    self._driver.implicitly_wait(1000)

    offer_divs: list[WebElement] = self._execute(self._execute_elements_by_selector, [], 'div[data-zone-name="OfferSnippet"]')

    for offer_div in offer_divs:
      product: Product = self._execute(self.__get_product, Product('', '', '', '', '', 0, []), offer_div, category_3_level_name, product_name, product_description, characteristics, product_image_path)
      products.append(product)

    return products


  def __get_products(self, productsMap: dict[str, list[str]]) -> list[Product]:
    """ Получение товаров

    Args:
      productsMap (dict[str, list[str]]): словарь с названиями категорий 3 уровня и ссылок на товары

    Returns:
      list[Product]: список товаров
    """

    products: list[Product] = []

    for [category_3_level_name, links] in productsMap:
      index: int = 0
      attempts_to_get_url: int = 0

      while index < len(links) and attempts_to_get_url < MAX_GET_URL_ATTEMPTS:
        self._set_cookies()
        self._driver.get(links[index])

        self._driver.implicitly_wait(1000)

        try:
          products_by_category: list[Product] = self._execute(self.__get_products_by_category, [], category_3_level_name)
          products.extend(products_by_category)

          index += 1
          attempts_to_get_url = 0
        except:
          attempts_to_get_url += 1

    return products

  def scrape(self, productsMap: dict[str, list[str]]) -> list[Product]:
    """ Скрепинг товаров

    Args:
      productsMap (dict[str, list[str]]): словарь с названиями категорий 3 уровня и ссылок на товары

    Returns:
      list[Product]: список товаров
    """

    products: list[Product] = []

    self._init_driver()
    self._set_cookies()

    self._driver.get(URL)
    self._set_cookies()

    #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
    if self._is_showed_captcha():
      self._driver.get(URL)

    products = self._execute(self.__get_products, [], productsMap)

    self._driver.quit()

    return products


