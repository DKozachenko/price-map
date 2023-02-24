from typing import Union
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from constants.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from services.base_scraping import BaseScrapingService
from entities.characteristic import Characteristic
from entities.product import Product

class ProductScrapingService(BaseScrapingService):
  def __init__(self) -> None:
    pass

  def __get_сharacteristics(self) -> list[Characteristic]:
    characteristics: list[Characteristic] = []
    characteristics_dls: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'dl[id]')
    for characteristics_dl in characteristics_dls:
      dt: WebElement = characteristics_dl.find_element(By.CSS_SELECTOR, 'dt')
      dd: WebElement = characteristics_dl.find_element(By.CSS_SELECTOR, 'dd')

      dt_text: str = dt.text
      dd_text: str = dd.text

      value: Union[int, float] = 0

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
    #TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    offer_links_a: list[WebElement] = offer_div.find_elements(By.CSS_SELECTOR, 'a[data-zone-name="offerLink"]')
    shop_name: str = offer_links_a[1].text

    price_span: WebElement = offer_div.find_element(By.CSS_SELECTOR, 'span[data-auto="mainPrice"] span')
    price: str = price_span.text
    price_int: int = int(price.replace(' ', ''))

    product: Product = Product(category_3_level_name, name, description, image_path, shop_name, price_int, characteristics)
    return product


  def __get_products_by_category(self, category_3_level_name: str) -> list[Product]:
    products: list[Product] = []

    product_actions_a: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-baobab-name="$productActions"] a')

    self._set_cookies()
    #нажатие на раздел "Характеристики"
    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(product_actions_a[1]).click(product_actions_a[1]).perform()

    product_name_h1: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'h1[data-baobab-name="$name"]')
    product_name: str = product_name_h1.text

    product_description_div: WebElement = self._driver.find_element(By.CSS_SELECTOR,
      'div[data-auto="product-full-specs"] div:not([class])'
    )
    product_description: str = product_description_div.text

    product_image_a: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[data-zone-name="picture"] img')
    product_image_path: str = product_image_a.get_attribute('src')

    characteristics: list[Characteristic] = self.__get_сharacteristics()
    #TODO: вариант, что может не быть офферов, или вариант,
    #что нет кнопки показать предложения, тк предложений в целом немного
    all_offers_a: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[data-auto="topOffers"] > div > div > a')
    self._set_cookies()
    #нажатие на "Все предложения"
    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(all_offers_a).click(all_offers_a).perform()
    self._driver.implicitly_wait(1000)

    offer_divs: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-zone-name="OfferSnippet"]')

    for offer_div in offer_divs:
      product: Product = self.__get_product(offer_div, category_3_level_name, product_name, product_description, characteristics, product_image_path)
      products.append(product)

    return products


  def __get_products(self, productsMap: dict[str, list[str]]) -> list[Product]:
    products: list[Product] = []

    for [category_3_level_name, links] in productsMap:
      index: int = 0
      attempts_to_get_url: int = 0

      while index < len(links) and attempts_to_get_url < MAX_GET_URL_ATTEMPTS:
        self._set_cookies()
        self._driver.get(links[index])

        self._driver.implicitly_wait(1000)

        try:
          products_by_category: list[Product] = self.__get_products_by_category(category_3_level_name)
          products.extend(products_by_category)

          index += 1
          attempts_to_get_url = 0
        except:
          attempts_to_get_url += 1

    return products


  def scrape(self, productsMap: dict[str, list[str]]) -> list[Product]:
    products: list[Product] = []

    self._init_driver()

    if self._driver:
      self._driver.get('https://market.yandex.ru/')
      self._set_cookies()

      #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if self._is_showed_captcha():
        self._driver.get('https://market.yandex.ru/')

      products = self.__get_products(productsMap)

      self._driver.quit()

    return products


