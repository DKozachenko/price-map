from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium_stealth import stealth
from chromedriver_py import binary_path as DRIVER_PATH

class BaseScrapingService:
  def __init__(self):
    self._driver = None

  def _isShowedCaptcha(self):
    title = self._driver.title
    return title == 'Ой!'

  def _initializeDriver(self):
    options = webdriver.ChromeOptions()
    options.add_argument("start-maximized")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)

    service = Service(DRIVER_PATH)
    self._driver = webdriver.Chrome(service=service, options=options)
    stealth(self._driver,
      user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.53 Safari/537.36',
      languages=["ru-RU", "ru"],
      vendor="Google Inc.",
      platform="Win32",
      webgl_vendor="Intel Inc.",
      renderer="Intel Iris OpenGL Engine",
      fix_hairline=True,
    )

  #TODO: возможно вынести все куки в константу (массив объектов)
  def _setCookies(self):
    self._driver.add_cookie({
      "name": '_yasc',
      "value": '9ha1SRrpGRjhtG7UFMAwuMiTnhwz508qkl6MJPPKqVnFGhsN8M8E9UjStnHZwsMf7d0=',
      "domain": '.yandex.ru'
    })
    self._driver.add_cookie({
      "name": '_ym_d',
      "value": '1676709667',
      "domain": '.yandex.ru'
    })
    self._driver.add_cookie({"name": '_ym_isad', "value": '2', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": '_ym_uid', "value": '1676709506689239215', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": '_ym_visorc', "value": 'b', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'bnpl_limit', "value": '200000', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'cmp-merge', "value": 'true', "domain": '.market.yandex.ru'})
    self._driver.add_cookie({"name": 'currentRegionId', "value": '65', "domain": '.market.yandex.ru'})
    self._driver.add_cookie({
      "name": 'currentRegionName',
      "value": '%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA',
      "domain": '.market.yandex.ru'
    })
    self._driver.add_cookie({
      "name": 'fetch_loyalty_notifications_time_stamp',
      "value": '2022-11-22T07:48:18.217Z',
      "domain": '.yandex.ru'
    })
    self._driver.add_cookie({"name": 'gdpr', "value": '0', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'is_gdpr', "value": '0', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'is_gdpr_b', "value": 'CMyzPRDqlgE=', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'js', "value": '1', "domain": '.market.yandex.ru'})
    self._driver.add_cookie({"name": 'mOC', "value": '1', "domain": '.market.yandex.ru'})
    self._driver.add_cookie({"name": 'nec', "value": '0', "domain": '.market.yandex.ru'})
    self._driver.add_cookie({
      "name": 'parent_reqid_seq',
      "value": '1676709669640%2F6a05ea3c54c0733b45194064f5f40500',
      "domain": '.market.yandex.ru'
    })
    self._driver.add_cookie({"name": 'reviews-merge', "value": 'true', "domain": '.market.yandex.ru'})
    self._driver.add_cookie({
      "name": 'server_request_id_market:index',
      "value": '1676709669640%2F6a05ea3c54c0733b45194064f5f40500',
      "domain": 'market.yandex.ru'
    })
    self._driver.add_cookie({
      "name": 'spravka',
      "value": 'dD0xNjc2NzA5NjY5O2k9MTc4LjQ5LjI1My4yMjM7RD0yMTBGNERCRTI4N0JFMUY2MkI5RUU0MTM5OEFCMjI0ODg2QzJCQ0M5OENERTE4QzMzQ0Q2MEIyOTlDOTc1MkIyQTdDMUE0RjI2MDM1MEU2NUM0ODlDODYwNEU1MTt1PTE2NzY3MDk2Njk1ODU5OTgxOTQ7aD00MTNjZWNmZjNjMGJkYTM2MGNiZTg4NjU4OTM1ZjMwNA==',
      "domain": '.yandex.ru'
    })
    self._driver.add_cookie({"name": 'skid', "value": '5087233331676709669', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'ugcp', "value": '1', "domain": 'market.yandex.ru'})
    self._driver.add_cookie({
      "name": 'visits',
      "value": '1676709669-1676709669-1676709669',
      "domain": '.market.yandex.ru'
    })
    self._driver.add_cookie({"name": 'yandexuid', "value": '5434898861676709667', "domain": '.yandex.ru'})
    self._driver.add_cookie({"name": 'yashr', "value": '5201021831676709667', "domain": '.yandex.ru'})
    self._driver.add_cookie({
      "name": 'ymex',
      "value": '1992069667.yrts.1676709667',
      "domain": '.yandex.ru'
    })
    self._driver.add_cookie({"name": 'yuidss', "value": '5434898861676709667', "domain": '.yandex.ru'})
