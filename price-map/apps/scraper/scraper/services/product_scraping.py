from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.wait import WebDriverWait

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from models.driver_path import DRIVER_PATH
from services.base_scraping import BaseScrapingService

class ProductScrapingService(BaseScrapingService):
  async def __getCharacteristics():
    characteristics = []
    characteristicsDls = await self.__driver.find_elements(By.css('dl[id]'))
    for characteristicDl in characteristicsDls:
      dt = await characteristicDl.find_element(By.css('dt'))
      dd = await characteristicDl.find_element(By.css('dd'))

      dtText = await dt.text
      ddText = await dd.text

      value = ''

      valueFloat = float(ddText)
      valueInt = int(ddText)

      if valueFloat is not None and str(valueFloat).length == ddText.length:
        value = valueFloat
      elif valueInt is not None and str(valueInt).length == ddText.length:
        value = valueInt
      else:
        value = ddText


      characteristic = {
        name: dtText,
        value: value
      }

      characteristics.push(characteristic)

    return characteristics

  async def __getProduct(offerDiv, info, name, description, characteristics, imagePath):
    #TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    offerLinksA = await offerDiv.find_elements(By.css('a[data-zone-name="offerLink"]'))
    shopName = await offerLinksA[1].text

    priceSpan = await offerDiv.find_element(By.css('span[data-auto="mainPrice"] span'))
    price = await priceSpan.text
    priceInt = int(price.replaceAll(' ', ''))

    product = {
      categoryInfo: info,
      name: name,
      description: description,
      characteristics: characteristics,
      imagePath: imagePath,
      shopName: shopName,
      price: priceInt
    }

    return product


  async def __getProductsByCategory(info):
    products = []

    productActionsA = await self.__driver.find_elements(By.css('div[data-baobab-name="$productActions"] a'))

    await self.__setCookies()
    #нажатие на раздел "Характеристики"
    actions = ActionChains(self.__driver)
    await actions.move_to_element(productActionsA[1]).click(productActionsA[1]).perform()

    productNameH1 = await self.__driver.find_element(By.css('h1[data-baobab-name="$name"]'))
    productName = await productNameH1.text

    productDescriptionDiv = await self.__driver.find_element(By.css(
      'div[data-auto="product-full-specs"] div:not([class])'
    ))
    productDescription = await productDescriptionDiv.text

    productImageA = await self.__driver.find_element(By.css('div[data-zone-name="picture"] img'))
    productImagePath = await productImageA.get_attribute('src')

    characteristics = await self.__getCharacteristics()
    #TODO: вариант, что может не быть офферов, или вариант,
    #что нет кнопки показать предложения, тк предложений в целом немного
    allOffersA = await self.__driver.find_element(By.css('div[data-auto="topOffers"] > div > div > a'))
    await self.__setCookies()
    #нажатие на "Все предложения"
    actions = ActionChains(self.__driver)
    await actions.move_to_element(allOffersA).click(allOffersA).perform()
    await self.__driver.implicitly_wait(1000)

    offerDivs = await self.__driver.find_elements(By.css('div[data-zone-name="OfferSnippet"]'))

    for offerDiv in offerDivs:
      product = await self.getProduct(offerDiv, info, productName, productDescription, characteristics, productImagePath)
      products.push(product)

    return products


  async def __getProducts(productsMap):
    products = []

    for [info, links] in productsMap:
      index = 0
      attemptsToGetUrl = 0

      while index < links.length and attemptsToGetUrl < MAX_GET_URL_ATTEMPTS:
        await self.__setCookies()
        await self.__driver.get(links[index])

        await self.__driver.implicitly_wait(1000)

        try:
          productsByCategory = await self.__getProductsByCategory(info)
          products.extend(productsByCategory)

          index += 1
          attemptsToGetUrl = 0
        except:
          attemptsToGetUrl += 1

    return products


  async def scrape(productsMap):
    products = []

    await self.__initialize__driver()

    if self.__driver:
      await self.__driver.get('https://market.yandex.ru/')
      await self.__setCookies()

      #TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if self.__isShowedCaptcha():
        await self.__driver.get('https://market.yandex.ru/')

      products = await self.__getProducts(productsMap)

      await self.__driver.quit()

    return products


