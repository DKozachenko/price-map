from selenium import web__driver
from selenium.web__driver.chrome.options import Options
from selenium.web__driver.chrome.service import Service
from selenium.web__driver.common.action_chains import ActionChains
from selenium.web__driver.support.wait import Web__driverWait

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from models.__driver_path import __driver_PATH
from services.base_scraping import BaseScrapingService

class ProductScrapingService(BaseScrapingService):
  async def __getCharacteristics():
    characteristics = []
    characteristicsDls = await self.__driver.findElements(By.css('dl[id]'))
    for characteristicDl in characteristicsDls:
      dt = await characteristicDl.findElement(By.css('dt'))
      dd = await characteristicDl.findElement(By.css('dd'))

      dtText = await dt.getText()
      ddText = await dd.getText()

      value = ''

      valueFloat = float(ddText)
      valueInt = int(ddText)

      if valueFloat is not None and str(valueFloat).length == ddText.length:
        value = valueFloat
      elif (valueInt is not None and str(valueInt).length === ddText.length)
        value = valueInt
      else
        value = ddText


      characteristic = {
        name: dtText,
        value
      }

      characteristics.push(characteristic)

    return characteristics

  async def __getProduct(offerDiv, info, name, description, characteristics, imagePath):
    #TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    offerLinksA = await offerDiv.findElements(By.css('a[data-zone-name="offerLink"]'))
    shopName = await offerLinksA[1].getText()

    priceSpan = await offerDiv.findElement(By.css('span[data-auto="mainPrice"] span'))
    price = await priceSpan.getText()
    priceInt = int(price.replaceAll(' ', ''))

    product = {
      categoryInfo: info,
      name,
      description,
      characteristics,
      imagePath,
      shopName,
      price: priceInt
    }

    return product


  async def getProductsByCategory__(info):
    products = []

    productActionsA = await self.__driver.findElements(By.css('div[data-baobab-name="$productActions"] a'))

    await self.__setCookies()
    #нажатие на раздел "Характеристики"
    actions = self.__driver.actions( async: true )
    await actions.move( origin: productActionsA[1] ).click().perform()

    productNameH1 = await self.__driver.findElement(By.css('h1[data-baobab-name="$name"]'))
    productName = await productNameH1.getText()

    productDescriptionDiv = await self.__driver.findElement(By.css(
      'div[data-auto="product-full-specs"] div:not([class])'
    ))
    productDescription = await productDescriptionDiv.getText()

    productImageA = await self.__driver.findElement(By.css('div[data-zone-name="picture"] img'))
    productImagePath = await productImageA.get_attribute('src')

    characteristics = await self.getCharacteristics()
    #TODO: вариант, что может не быть офферов, или вариант,
    #что нет кнопки показать предложения, тк предложений в целом немного
    allOffersA = await self.__driver.findElement(By.css('div[data-auto="topOffers"] > div > div > a'))
    await self.setCookies()
    #нажатие на "Все предложения"
    actions = self.__driver.actions( async: true )
    await actions.move( origin: allOffersA ).click().perform()
    await self.__driver.manage().setTimeouts(  implicit: 1000  )

    offerDivs = await self.__driver.findElements(By.css('div[data-zone-name="OfferSnippet"]'))

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
          products.push(...productsByCategory)

          index += 1
          attemptsToGetUrl = 0
        except:
          attemptsToGetUrl += 1

    return products


  async scrape(productsMap: Map<BreadcrumbInfo, string[]>): Promise<any[]>
     products = []

    await self.initialize__driver()

    if (self.__driver)
      await self.__driver.get('https://market.yandex.ru/')
      await self.setCookies()

      //TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if (self.isShowedCaptcha())
        await self.__driver.get('https://market.yandex.ru/')


      products = await self.getProducts(productsMap)

      await self.__driver.quit()

    return products


