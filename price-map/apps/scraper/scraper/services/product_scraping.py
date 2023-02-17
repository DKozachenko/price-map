from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.by import By

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from services.base_scraping import BaseScrapingService

class ProductScrapingService(BaseScrapingService):
  def __init__(self):
    pass

  def __getCharacteristics(self):
    characteristics = []
    characteristicsDls = self._driver.find_elements(By.CSS_SELECTOR, 'dl[id]')
    for characteristicDl in characteristicsDls:
      dt = characteristicDl.find_element(By.CSS_SELECTOR, 'dt')
      dd = characteristicDl.find_element(By.CSS_SELECTOR, 'dd')

      dtText = dt.text
      ddText = dd.text

      value = ''

      valueFloat = float(ddText)
      valueInt = int(ddText)

      if valueFloat is not None and len(str(valueFloat)) == len(ddText):
        value = valueFloat
      elif valueInt is not None and len(str(valueInt)) == len(ddText):
        value = valueInt
      else:
        value = ddText


      characteristic = {
        "name": dtText,
        "value": value
      }

      characteristics.append(characteristic)

    return characteristics

  def __getProduct(self, offerDiv, info, name, description, characteristics, imagePath):
    #TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    offerLinksA = offerDiv.find_elements(By.CSS_SELECTOR, 'a[data-zone-name="offerLink"]')
    shopName = offerLinksA[1].text

    priceSpan = offerDiv.find_element(By.CSS_SELECTOR, 'span[data-auto="mainPrice"] span')
    price = priceSpan.text
    priceInt = int(price.replace(' ', ''))

    product = {
      "categoryInfo": info,
      "name": name,
      "description": description,
      "characteristics": characteristics,
      "imagePath": imagePath,
      "shopName": shopName,
      "price": priceInt
    }

    return product


  def __getProductsByCategory(self, info):
    products = []

    productActionsA = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-baobab-name="$productActions"] a')

    self._setCookies()
    #нажатие на раздел "Характеристики"
    actions = ActionChains(self._driver)
    actions.move_to_element(productActionsA[1]).click(productActionsA[1]).perform()

    productNameH1 = self._driver.find_element(By.CSS_SELECTOR, 'h1[data-baobab-name="$name"]')
    productName = productNameH1.text

    productDescriptionDiv = self._driver.find_element(By.CSS_SELECTOR, 
      'div[data-auto="product-full-specs"] div:not([class])'
    )
    productDescription = productDescriptionDiv.text

    productImageA = self._driver.find_element(By.CSS_SELECTOR, 'div[data-zone-name="picture"] img')
    productImagePath = productImageA.get_attribute('src')

    characteristics = self.__getCharacteristics()
    #TODO: вариант, что может не быть офферов, или вариант,
    #что нет кнопки показать предложения, тк предложений в целом немного
    allOffersA = self._driver.find_element(By.CSS_SELECTOR, 'div[data-auto="topOffers"] > div > div > a')
    self._setCookies()
    #нажатие на "Все предложения"
    actions = ActionChains(self._driver)
    actions.move_to_element(allOffersA).click(allOffersA).perform()
    self._driver.implicitly_wait(1000)

    offerDivs = self._driver.find_elements(By.CSS_SELECTOR, 'div[data-zone-name="OfferSnippet"]')

    for offerDiv in offerDivs:
      product = self.__getProduct(offerDiv, info, productName, productDescription, characteristics, productImagePath)
      products.append(product)

    return products


  def __getProducts(self, productsMap):
    products = []

    for [info, links] in productsMap:
      index = 0
      attemptsToGetUrl = 0

      while index < len(links) and attemptsToGetUrl < MAX_GET_URL_ATTEMPTS:
        self._setCookies()
        self._driver.get(links[index])

        self._driver.implicitly_wait(1000)

        try:
          productsByCategory = self.__getProductsByCategory(info)
          products.extend(productsByCategory)

          index += 1
          attemptsToGetUrl = 0
        except:
          attemptsToGetUrl += 1

    return products


  def scrape(self, productsMap):
    products = []

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


