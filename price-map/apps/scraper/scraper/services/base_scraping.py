from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

from models.max_get_url_attempts import MAX_GET_URL_ATTEMPTS
from models.driver_path import DRIVER_PATH

class BaseScrapingService:
  _driver = None

  def __init__():
    pass

  async def _isShowedCaptcha():
    title = await self._driver.getTitle()
    return title == 'Ой!'

  async def _initializeDriver():
    options = webdriver.ChromeOptions()
    service = Service(DRIVER_PATH)
    self._driver = webdriver.Chrome(service=service, options=options)
    await self._driver.maximize_window()

  #TODO: возможно вынести все куки в константу (массив объектов)
  async def _setCookies():
    await self._driver.add_cookie({
      name: '_yasc',
      value: 'It7+VfsAEkQQ6+5y2bY/39GDw+x4bK4FrjdHSH6JvdMjCBSKxfB8kOXBcyhvAiVUYYQ=',
      domain: '.yandex.ru'
    })
    await self._driver.add_cookie({
      name: '_ym_d',
      value: '1669101421/yQUXLkON7IOuAkzlnLOutwD3Q',
      domain: '.yandex.ru'
    })
    await self._driver.add_cookie({name: '_ym_isad', value: '2', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: '_ym_uid', value: '1664609197646862615', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: '_ym_visorc', value: 'b', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: 'bnpl_limit', value: '200000', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: 'cmp-merge', value: 'true', domain: '.market.yandex.ru'})
    await self._driver.add_cookie({name: 'currentRegionId', value: '65', domain: 'market.yandex.ru'})
    await self._driver.add_cookie({
      name: 'currentRegionName',
      value: '%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA',
      domain: 'market.yandex.ru'
    })
    await self._driver.add_cookie({
      name: 'fetch_loyalty_notifications_time_stamp',
      value: '2022-11-22T07:48:18.217Z',
      domain: '.yandex.ru'
    })
    await self._driver.add_cookie({name: 'gdpr', value: '0', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: 'is_gdpr', value: '0', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: 'is_gdpr_b', value: 'CMyzPRDqlgE=', domain: '.yandex.ru'})
    await self._driver.add_cookie({name: 'js', value: '1', domain: 'market.yandex.ru'})
    await self._driver.add_cookie({name: 'mOC', value: '1', domain: 'market.yandex.ru'})
    await self._driver.add_cookie({name: 'nec', value: '0', domain: 'market.yandex.ru'})
    await self._driver.add_cookie({
      name: 'parent_reqid_seq',
      value: '1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500%2C1669101443600%2Ff8c4170b15d711bb47d1a3f609ee0500',
      domain: '.market.yandex.ru'
    })
    await self._driver.add_cookie({name: 'reviews-merge', value: 'true', domain: '.market.yandex.ru'})
    await self._driver.add_cookie({
      name: 'session_server_request_id_market:product/product--futbolka-suvenirshop-ghostbuster-gostbaster-maslennikov/1750369481',
      value: '1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500',
      domain: 'market.yandex.ru'
    })
    await self._driver.add_cookie({
      name: 'spravka',
      value: 'dD0xNjY5MTAzMjQyO2k9MTc4LjQ5LjI1My4yMjM7RD1GRDMzOENFRkM2RUJEQTlEMTE0OUM3MTQwNDhCOTQ1MDQyNUI0MDBFOERDNjJCODhDNEEwMUZERTZFMDQ5QTY4MTI3NkU3QzY7dT0xNjY5MTAzMjQyODk3NDY3NDIxO2g9NGUwM2I5OGI4M2FkMTRmMzNmMmU4Mzg4OTRjNjc5MTA=',
      domain: '.yandex.ru'
    })
    await self._driver.add_cookie({name: 'skid', value: '3271347601669101427', domain: 'market.yandex.ru'})
    await self._driver.add_cookie({name: 'ugcp', value: '1', domain: 'market.yandex.ru'})
    await self._driver.add_cookie({
      name: 'visits',
      value: '1669103160-1669103160-1669103160',
      domain: '.market.yandex.ru'
    })
    await self._driver.add_cookie({name: 'yandexuid', value: '96788151669101421', domain: '.yandex.ru'})
    await self._driver.add_cookie({
      name: 'ymex',
      value: '1984461421.yrts.1669101421#1984461421.yrtsi.1669101421',
      domain: '.yandex.ru'
    })
    await self._driver.add_cookie({name: 'yuidss', value: '96788151669101421', domain: '.yandex.ru'})
