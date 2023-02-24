from typing import Any, Union
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from services.base_scraping import BaseScrapingService

class ProductScrapingService(BaseScrapingService):
  def __init__(self) -> None:
    pass

  def __getCharacteristics(self) -> list[dict[str, Any]]:
    characteristics: list[dict[str, Any]] = []
    characteristicsDls: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'dl[id]')
    for characteristicDl in characteristicsDls:
      dt: WebElement = characteristicDl.find_element(By.CSS_SELECTOR, 'dt')
      dd: WebElement = characteristicDl.find_element(By.CSS_SELECTOR, 'dd')

      dtText: str = dt.text
      ddText: str = dd.text

      value: Union[int, float] = ''

      valueFloat: float = float(ddText)
      valueInt: int = int(ddText)

      if valueFloat is not None and len(str(valueFloat)) == len(ddText):
        value = valueFloat
      elif valueInt is not None and len(str(valueInt)) == len(ddText):
        value = valueInt
      else:
        value = ddText

      characteristic: dict[str, Any] = {
        "name": dtText,
        "value": value
      }

      characteristics.append(characteristic)

    return characteristics

  def __getProduct(self, offerDiv: WebElement, info: str, name: str, description: str, characteristics: list[dict[str, Any]], imagePath: str) -> Any:
    #TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    offerLinksA: list[WebElement] = offerDiv.find_elements(By.CSS_SELECTOR, 'a[data-zone-name="offerLink"]')
    shopName: str = offerLinksA[1].text

    priceSpan: WebElement = offerDiv.find_element(By.CSS_SELECTOR, 'span[data-auto="mainPrice"] span')
    price: str = priceSpan.text
    priceInt: int = int(price.replace(' ', ''))

    product: Any = {
      "categoryInfo": info,
      "name": name,
      "description": description,
      "characteristics": characteristics,
      "imagePath": imagePath,
      "shopName": shopName,
      "price": priceInt
    }

    return product


  def __getProductsByCategory(self, info: str) -> list[Any]:
    products: list[Any] = []

    productActionsA: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-baobab-name="$productActions"] a')

    self._setCookies()
    #нажатие на раздел "Характеристики"
    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(productActionsA[1]).click(productActionsA[1]).perform()

    productNameH1: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'h1[data-baobab-name="$name"]')
    productName: str = productNameH1.text

    productDescriptionDiv: WebElement = self._driver.find_element(By.CSS_SELECTOR, 
      'div[data-auto="product-full-specs"] div:not([class])'
    )
    productDescription: str = productDescriptionDiv.text

    productImageA: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[data-zone-name="picture"] img')
    productImagePath: str = productImageA.get_attribute('src')

    characteristics: list[dict[str, Any]] = self.__getCharacteristics()
    #TODO: вариант, что может не быть офферов, или вариант,
    #что нет кнопки показать предложения, тк предложений в целом немного
    allOffersA: WebElement = self._driver.find_element(By.CSS_SELECTOR, 'div[data-auto="topOffers"] > div > div > a')
    self._setCookies()
    #нажатие на "Все предложения"
    actions: ActionChains = ActionChains(self._driver)
    actions.move_to_element(allOffersA).click(allOffersA).perform()
    self._driver.implicitly_wait(1000)

    offerDivs: list[WebElement] = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-zone-name="OfferSnippet"]')

    for offerDiv in offerDivs:
      product: Any = self.__getProduct(offerDiv, info, productName, productDescription, characteristics, productImagePath)
      products.append(product)

    return products


  def __getProducts(self, productsMap: dict[str, list[str]]) -> list[Any]:
    products: list[Any] = []

    for [info, links] in productsMap:
      index: int = 0
      attemptsToGetUrl: int = 0

      while index < len(links) and attemptsToGetUrl < MAX_GET_URL_ATTEMPTS:
        self._setCookies()
        self._driver.get(links[index])

        self._driver.implicitly_wait(1000)

        try:
          productsByCategory: list[Any] = self.__getProductsByCategory(info)
          products.extend(productsByCategory)

          index += 1
          attemptsToGetUrl = 0
        except:
          attemptsToGetUrl += 1

    return products


  def scrape(self, productsMap: dict[str, list[str]]) -> list[Any]:
    products: list[Any] = []

    self._initializeDriver()

    if self._driver:
      self._driver.get('https://market.yandex.ru/')
      self._setCookies()

      #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if self._isShowedCaptcha():
        self._driver.get('https://market.yandex.ru/')

      products = self.__getProducts(productsMap)

      self._driver.quit()

    return products


