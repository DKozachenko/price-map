import { Builder, Browser } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

export abstract class BaseScrapingService {
  protected driver = null;
  protected readonly MAX_ATTEMPTS_TO_GET_URL = 10;

  protected async isShowedCaptcha(): Promise<boolean> {
    const title: string = await this.driver.getTitle();

    return title === 'Ой!';
  }

  protected async initializeDriver(): Promise<void> {
    const chromeOptions = new chrome.Options();
    const service = new chrome.ServiceBuilder('C:/Users/kozac/Downloads/chromedriver_win32/chromedriver.exe');
    this.driver = new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(chromeOptions)
      .setChromeService(service)
      .build();
    await this.driver.manage().window().maximize();
  }

  //TODO: возможно вынести все куки в константу (массив объектов)
  protected async setCookies(): Promise<void> {
    await this.driver
      .manage()
      .addCookie({
        name: '_yasc', value: 'It7+VfsAEkQQ6+5y2bY/39GDw+x4bK4FrjdHSH6JvdMjCBSKxfB8kOXBcyhvAiVUYYQ=', 
        domain: '.yandex.ru'
      });
    await this.driver
      .manage()
      .addCookie({
        name: '_ym_d', 
        value: '1669101421/yQUXLkON7IOuAkzlnLOutwD3Q', 
        domain: '.yandex.ru'
      });
    await this.driver.manage().addCookie({name: '_ym_isad', value: '2', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: '_ym_uid', value: '1664609197646862615', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: '_ym_visorc', value: 'b', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: 'bnpl_limit', value: '200000', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: 'cmp-merge', value: 'true', domain: '.market.yandex.ru'});
    await this.driver.manage().addCookie({name: 'currentRegionId', value: '65', domain: 'market.yandex.ru'});
    await this.driver
      .manage()
      .addCookie({
        name: 'currentRegionName', 
        value: '%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA', 
        domain: 'market.yandex.ru'
      });
    await this.driver
      .manage()
      .addCookie({
        name: 'fetch_loyalty_notifications_time_stamp', 
        value: '2022-11-22T07:48:18.217Z', 
        domain: '.yandex.ru'
      });
    await this.driver.manage().addCookie({name: 'gdpr', value: '0', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: 'is_gdpr', value: '0', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: 'is_gdpr_b', value: 'CMyzPRDqlgE=', domain: '.yandex.ru'});
    await this.driver.manage().addCookie({name: 'js', value: '1', domain: 'market.yandex.ru'});
    await this.driver.manage().addCookie({name: 'mOC', value: '1', domain: 'market.yandex.ru'});
    await this.driver.manage().addCookie({name: 'nec', value: '0', domain: 'market.yandex.ru'});
    await this.driver
      .manage()
      .addCookie({
        name: 'parent_reqid_seq', 
        value: '1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500%2C1669101443600%2Ff8c4170b15d711bb47d1a3f609ee0500', 
        domain: '.market.yandex.ru'
      });
    await this.driver.manage().addCookie({name: 'reviews-merge', value: 'true', domain: '.market.yandex.ru'});
    await this.driver
      .manage()
      .addCookie({
        // eslint-disable-next-line max-len
        name: 'session_server_request_id_market:product/product--futbolka-suvenirshop-ghostbuster-gostbaster-maslennikov/1750369481', 
        value: '1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500', 
        domain: 'market.yandex.ru'
      });
    await this.driver
      .manage()
      .addCookie({
        name: 'spravka', 
        // eslint-disable-next-line max-len
        value: 'dD0xNjY5MTAzMjQyO2k9MTc4LjQ5LjI1My4yMjM7RD1GRDMzOENFRkM2RUJEQTlEMTE0OUM3MTQwNDhCOTQ1MDQyNUI0MDBFOERDNjJCODhDNEEwMUZERTZFMDQ5QTY4MTI3NkU3QzY7dT0xNjY5MTAzMjQyODk3NDY3NDIxO2g9NGUwM2I5OGI4M2FkMTRmMzNmMmU4Mzg4OTRjNjc5MTA=', 
        domain: '.yandex.ru'
      });
    await this.driver.manage().addCookie({name: 'skid', value: '3271347601669101427', domain: 'market.yandex.ru'});
    await this.driver.manage().addCookie({name: 'ugcp', value: '1', domain: 'market.yandex.ru'});
    await this.driver
      .manage()
      .addCookie({
        name: 'visits', 
        value: '1669103160-1669103160-1669103160', 
        domain: '.market.yandex.ru'
      });
    await this.driver.manage().addCookie({name: 'yandexuid', value: '96788151669101421', domain: '.yandex.ru'});
    await this.driver
      .manage()
      .addCookie({
        name: 'ymex', 
        value: '1984461421.yrts.1669101421#1984461421.yrtsi.1669101421', 
        domain: '.yandex.ru'
      });
    await this.driver.manage().addCookie({name: 'yuidss', value: '96788151669101421', domain: '.yandex.ru'});
  }
}