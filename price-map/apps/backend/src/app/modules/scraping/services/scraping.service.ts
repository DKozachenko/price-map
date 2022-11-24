import { Injectable } from "@nestjs/common";
import { Builder, Browser, By, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';


@Injectable()
export class ScrapingService {
  private readonly catalogPopupButtonId: string = 'catalogPopupButton';
  private readonly catalogContentSelector: string = 'div[data-zone-name="catalog-content"]';
  private readonly category1LevelLisSelector: string = 'ul[role="tablist"]:first-child li';
  private readonly moreSpansSelector: string = 'div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span';
  private readonly category1LevelASelector: string = 'div[role="heading"] > a';
  private readonly category2LevelDivsSelector: string = 'div[role="heading"] div div[data-auto="category"]';
  private readonly category2LevelDivHeadingSelector: string = 'div[role="heading"]';
  private readonly categories3LevelDivsSelector: string = 'ul[data-autotest-id="subItems"] li > div';

  private driver = null;

  private async isShowedCaptcha(): Promise<boolean> {
    const title: string = await this.driver.getTitle();

    return title === 'Ой!';
  }

  private async initializeDriver(): Promise<void> {
    const chromeOptions = new chrome.Options();
    const service = new chrome.ServiceBuilder('C:/Users/kozac/Downloads/chromedriver_win32/chromedriver.exe');
    this.driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).setChromeService(service).build();
    await this.driver.manage().window().maximize();
  }

  private async setCookies(): Promise<void> {
    // await (this.driver.manage() as any).addCookie({name: "_yasc", value: "It7+VfsAEkQQ6+5y2bY/39GDw+x4bK4FrjdHSH6JvdMjCBSKxfB8kOXBcyhvAiVUYYQ=", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "_ym_d", value: "1669101421/yQUXLkON7IOuAkzlnLOutwD3Q", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "_ym_isad", value: "2", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "_ym_uid", value: "1664609197646862615", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "_ym_visorc", value: "b", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "bnpl_limit", value: "200000", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "cmp-merge", value: "true", domain: ".market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "currentRegionId", value: "65", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "currentRegionName", value: "%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "fetch_loyalty_notifications_time_stamp", value: "2022-11-22T07:48:18.217Z", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "gdpr", value: "0", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "is_gdpr", value: "0", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "is_gdpr_b", value: "CMyzPRDqlgE=", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "js", value: "1", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "mOC", value: "1", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "nec", value: "0", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "parent_reqid_seq", value: "1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500%2C1669101443600%2Ff8c4170b15d711bb47d1a3f609ee0500", domain: ".market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "reviews-merge", value: "true", domain: ".market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "session_server_request_id_market:product/product--futbolka-suvenirshop-ghostbuster-gostbaster-maslennikov/1750369481", value: "1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "spravka", value: "dD0xNjY5MTAzMjQyO2k9MTc4LjQ5LjI1My4yMjM7RD1GRDMzOENFRkM2RUJEQTlEMTE0OUM3MTQwNDhCOTQ1MDQyNUI0MDBFOERDNjJCODhDNEEwMUZERTZFMDQ5QTY4MTI3NkU3QzY7dT0xNjY5MTAzMjQyODk3NDY3NDIxO2g9NGUwM2I5OGI4M2FkMTRmMzNmMmU4Mzg4OTRjNjc5MTA=", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "skid", value: "3271347601669101427", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "ugcp", value: "1", domain: "market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "visits", value: "1669103160-1669103160-1669103160", domain: ".market.yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "yandexuid", value: "96788151669101421", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "ymex", value: "1984461421.yrts.1669101421#1984461421.yrtsi.1669101421", domain: ".yandex.ru"});
    // await (this.driver.manage() as any).addCookie({name: "yuidss", value: "96788151669101421", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "_yasc", value: "It7+VfsAEkQQ6+5y2bY/39GDw+x4bK4FrjdHSH6JvdMjCBSKxfB8kOXBcyhvAiVUYYQ=", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "_ym_d", value: "1669101421/yQUXLkON7IOuAkzlnLOutwD3Q", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "_ym_isad", value: "2", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "_ym_uid", value: "1664609197646862615", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "_ym_visorc", value: "b", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "bnpl_limit", value: "200000", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "cmp-merge", value: "true", domain: ".market.yandex.ru"});
    await this.driver.manage().addCookie({name: "currentRegionId", value: "65", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "currentRegionName", value: "%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "fetch_loyalty_notifications_time_stamp", value: "2022-11-22T07:48:18.217Z", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "gdpr", value: "0", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "is_gdpr", value: "0", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "is_gdpr_b", value: "CMyzPRDqlgE=", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "js", value: "1", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "mOC", value: "1", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "nec", value: "0", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "parent_reqid_seq", value: "1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500%2C1669101443600%2Ff8c4170b15d711bb47d1a3f609ee0500", domain: ".market.yandex.ru"});
    await this.driver.manage().addCookie({name: "reviews-merge", value: "true", domain: ".market.yandex.ru"});
    await this.driver.manage().addCookie({name: "session_server_request_id_market:product/product--futbolka-suvenirshop-ghostbuster-gostbaster-maslennikov/1750369481", value: "1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "spravka", value: "dD0xNjY5MTAzMjQyO2k9MTc4LjQ5LjI1My4yMjM7RD1GRDMzOENFRkM2RUJEQTlEMTE0OUM3MTQwNDhCOTQ1MDQyNUI0MDBFOERDNjJCODhDNEEwMUZERTZFMDQ5QTY4MTI3NkU3QzY7dT0xNjY5MTAzMjQyODk3NDY3NDIxO2g9NGUwM2I5OGI4M2FkMTRmMzNmMmU4Mzg4OTRjNjc5MTA=", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "skid", value: "3271347601669101427", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "ugcp", value: "1", domain: "market.yandex.ru"});
    await this.driver.manage().addCookie({name: "visits", value: "1669103160-1669103160-1669103160", domain: ".market.yandex.ru"});
    await this.driver.manage().addCookie({name: "yandexuid", value: "96788151669101421", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "ymex", value: "1984461421.yrts.1669101421#1984461421.yrtsi.1669101421", domain: ".yandex.ru"});
    await this.driver.manage().addCookie({name: "yuidss", value: "96788151669101421", domain: ".yandex.ru"});
  }

  private async openCatalogPopup(): Promise<void> {
    let actions = this.driver.actions({ async: true });
        
    const catalogPopupButton = await this.driver.findElement(By.id(this.catalogPopupButtonId));
    await actions.move({ origin: catalogPopupButton }).click().perform();

    //ожидание пока прогрузится каталог
    await this.driver.wait(until.elementLocated(By.css(this.catalogContentSelector)), 10000);
  }

  private async clickAllMoreSpans(): Promise<void> {
    const moreSpans = await this.driver.findElements(By.css(this.moreSpansSelector));
    for (const span of moreSpans) {
      const actions = this.driver.actions({ async: true });
      await actions.move({ origin: span }).click().perform();
    }
  }

  private async getCategories1Level(): Promise<any[]> {
    const categories1Level: any[] = [];
    const category1LevelLis = await this.driver.findElements(By.css(this.category1LevelLisSelector));

    for (const category1LevelLi of category1LevelLis) {
      const actions = this.driver.actions({ async: true });
      await actions.move({ origin: category1LevelLi }).perform();

      await this.clickAllMoreSpans();
      
      const category1LevelA = await this.driver.findElement(By.css(this.category1LevelASelector));
      const category1LevelName = await category1LevelA.getText();
      const category1Level = {
        name: category1LevelName,
        categories2Level: []
      }

      const category2LevelDivs = await this.driver.findElements(By.css(this.category2LevelDivsSelector))
      
      for (const category2LevelDiv of category2LevelDivs) {
        const category2LevelDivHeading = await category2LevelDiv.findElement(By.css(this.category2LevelDivHeadingSelector));
        const category2LevelName = await category2LevelDivHeading.getText()
        const category2Level = {
          name: category2LevelName,
          categories3Level: []
        }

        const categories3LevelDivs = await category2LevelDiv.findElements(By.css(this.categories3LevelDivsSelector))

        if (categories3LevelDivs) {
          for (const categories3LevelDiv of categories3LevelDivs) {
            const cat3Name = await categories3LevelDiv.getText();
            category2Level.categories3Level.push({
              name: cat3Name
            })
          }
        }
        
        category1Level.categories2Level.push(category2Level);
      }

      categories1Level.push(category1Level)
    }

    return categories1Level;
  }

  public async scrapeCategories1Level(): Promise<any[]> {
    let categories1Level: any[] = [];

    await this.initializeDriver();

    if (this.driver) {
      await this.driver.get('https://market.yandex.ru/');
      await this.setCookies();

      if (this.isShowedCaptcha()) {
        await this.driver.get('https://market.yandex.ru/');
      }

      await this.openCatalogPopup();

      categories1Level = await this.getCategories1Level();
      
      await this.driver.quit();
    }

    return categories1Level;
  }
}