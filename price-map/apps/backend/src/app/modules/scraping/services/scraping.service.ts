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
        //при переборе не получает элемент
        const category2LevelName = await category2LevelDivHeading.getText()
        const category2Level = {
          name: category2LevelName,
          categories3Level: []
        }

        const categories3LevelDivs = await category2LevelDiv.findElements(By.css(this.categories3LevelDivsSelector))

        if (categories3LevelDivs) {
          //for (const categories3LevelDiv of categories3LevelDivs) {
            const actions = this.driver.actions({ async: true });
            await actions.move({ origin: categories3LevelDivs[0] }).click().perform();

            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const breadcrumb = await this.driver.findElements(By.css('ol[itemscope] li'));

            const category1LevelNameTemp: string = await breadcrumb[0].getText();
            const category2LevelNameTemp: string = await breadcrumb[1].getText();
            const category3LevelNameTemp: string = await breadcrumb[2].getText();
            console.log('path', category1LevelNameTemp, category2LevelNameTemp, category3LevelNameTemp)

            const filters = [];

            const filterDiv = await this.driver.findElement(By.css('div[data-grabber="SearchFilters"]'));
            const filterDivsBoolean = await filterDiv.findElements(By.css('div[data-filter-type="boolean"]'));
            const filterDivsEnum = await filterDiv.findElements(By.css('div[data-filter-type="enum"]'));
            const filterDivsRange = await filterDiv.findElements(By.css('div[data-filter-type="range"]'));

            //бульки
            for (const filterDivBoolean of filterDivsBoolean) {
              const filterBooleanName: string = await filterDivBoolean.getText();

              filters.push({
                name: filterBooleanName,
                type: 'boolean'
              })
            // }

            //рэнжи
            for (const filterDivRange of filterDivsRange) {
              const filterDivRangeLegend = await filterDivRange.findElement(By.css('fieldset span'));
              const filterDivRangeName: string = await filterDivRangeLegend.getText();
              const filterDivRangeMinLabel = await filterDivRange.findElement(By.css('span[data-auto="filter-range-min"] label:not([for])'));
              const filterDivRangeMaxLabel = await filterDivRange.findElement(By.css('span[data-auto="filter-range-max"] label:not([for])'));

              const filterDivRangeMinLabelText: string = await filterDivRangeMinLabel.getText();
              const filterDivRangeMaxLabelText: string = await filterDivRangeMaxLabel.getText();

              const filterDivRangeMinValueStr: string = filterDivRangeMinLabelText.split(' ')[1];
              const filterDivRangeMaxValueStr: string = filterDivRangeMaxLabelText.split(' ')[1];

              let filterRangeMinValue: number = 0;

              if (filterDivRangeMinValueStr.includes(',')) {
                filterRangeMinValue = Number.parseFloat(filterDivRangeMinValueStr.replace(',', '.'));
              } else {
                filterRangeMinValue = Number.parseInt(filterDivRangeMinValueStr);
              }

              let filterRangeMaxValue: number = 0;

              if (filterDivRangeMaxValueStr.includes(',')) {
                filterRangeMaxValue = Number.parseFloat(filterDivRangeMaxValueStr.replace(',', '.'));
              } else {
                filterRangeMaxValue = Number.parseInt(filterDivRangeMaxValueStr);
              }

              filters.push({
                name: filterDivRangeName,
                type: 'range',
                value: [filterRangeMinValue, filterRangeMaxValue]
              })
            }

            //енумки
            for (const filterDivEnum of filterDivsEnum) {
              const filterDivEnumLegend = await filterDivEnum.findElement(By.css('fieldset legend'));
              const filterDivEnumName: string = await filterDivEnumLegend.getText();

              await this.driver.manage().setTimeouts( { implicit: 3000 } );
              const filterEnumFieldsetDivs = await filterDivEnum.findElements(By.css('fieldset > div > div'));

              for (let fieldsetDiv of filterEnumFieldsetDivs) {
                const moreSpans = await fieldsetDiv.findElements(By.css('span[tabindex="0"]'))

                for (let moreSpan of moreSpans) {
                  const actions = this.driver.actions({ async: true });
                  await this.driver.actions().scroll(0, 0, 0, 0, moreSpan).perform()
                  await actions.move({ origin: moreSpan }).click().perform();
                  await this.driver.manage().setTimeouts( { implicit: 1000 } );
                }                
              }
              
              
              

              const filterEnumValueDivs = await filterDivEnum.findElements(By.css('fieldset div[data-baobab-name="FilterValue"]'));
              console.log('filterEnumValueDivs', filterEnumValueDivs.length)
              const filterValues: string[] = [];
              let count = 0;
              
              for (const filterEnumValueDiv of filterEnumValueDivs) {
                ++count;
                const filterEnumValue: string = await filterEnumValueDiv.getText();
                console.log('after', filterEnumValue)
                if (count === 12) {
                  await this.driver.actions().scroll(0, 0, 0, 200, filterEnumValueDiv).perform()
                }
                
                console.log('after scroll', count)
                filterValues.push(filterEnumValue);
              }

              filters.push({
                name: filterDivEnumName,
                type: 'enum',
                value: filterValues
              })
            }

            console.log('filters', filters)
            await new Promise(resolve => setTimeout(resolve, 1330000));
            const category3LevelName = await categories3LevelDivs[0].getText();
            category2Level.categories3Level.push({
              name: category3LevelName,
              filters
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

      //TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
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