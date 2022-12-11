/* eslint max-depth: "off" */
import { Injectable } from '@nestjs/common';
import { By, until } from 'selenium-webdriver';
import { BaseScrapingService } from './base-scraping.service';

interface BreadcrumbInfo {
  [key: string]: string,
  category1LevelName: string,
  category2LevelName: string,
  category3LevelName: string,
}

@Injectable()
export class CategoryScrapingService extends BaseScrapingService {
  private readonly category3LevelLinks: Set<string> = new Set<string>();
  public productsMap: Map<BreadcrumbInfo, string[]> = new Map<BreadcrumbInfo, string[]>();

  private async openCatalogPopup(): Promise<void> {
    const actions = this.driver.actions({ async: true });

    const catalogPopupButton = await this.driver.findElement(By.id('catalogPopupButton'));
    await actions.move({ origin: catalogPopupButton }).click().perform();

    //ожидание пока прогрузится каталог
    await this.driver.wait(until.elementLocated(By.css('div[data-zone-name="catalog-content"]')), 10000);
  }

  private async clickAllMoreSpans(): Promise<void> {
    const moreSpans = await this.driver
      .findElements(By.css(
        'div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span'
      ));
    for (const span of moreSpans) {
      const actions = this.driver.actions({ async: true });
      await actions.move({ origin: span }).click().perform();
    }
  }

  private async getFilters(): Promise<any[]> {
    const filters: any[] = [];

    const filterDiv = await this.driver.findElement(By.css('div[data-grabber="SearchFilters"]'));
    const filterDivsBoolean = await filterDiv.findElements(By.css('div[data-filter-type="boolean"]'));
    const filterDivsEnum = await filterDiv.findElements(By.css('div[data-filter-type="enum"]'));
    const filterDivsRange = await filterDiv.findElements(By.css('div[data-filter-type="range"]'));

    //TODO: возможно разделить получение булек, рэнджей и енамов в разные методы
    //бульки
    for (const filterDivBoolean of filterDivsBoolean) {
      const filterBooleanName: string = await filterDivBoolean.getText();

      if (filterBooleanName) {
        filters.push({
          name: filterBooleanName.replace('\n', ''),
          type: 'boolean'
        });
      }
    }

    //рэнжи
    for (const filterDivRange of filterDivsRange) {
      const filterDivRangeLegend = await filterDivRange.findElement(By.css('fieldset span'));
      const filterDivRangeName: string = await filterDivRangeLegend.getText();
      const filterDivRangeMinLabel = await filterDivRange
        .findElement(By.css(
          'span[data-auto="filter-range-min"] label:not([for])'
        ));
      const filterDivRangeMaxLabel = await filterDivRange
        .findElement(By.css(
          'span[data-auto="filter-range-max"] label:not([for])'
        ));

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

      if (filterDivRangeName) {
        filters.push({
          name: filterDivRangeName,
          type: 'range',
          value: [
            filterRangeMinValue,
            filterRangeMaxValue
          ]
        });
      }
    }

    //енумки
    for (const filterDivEnum of filterDivsEnum) {
      const filterDivEnumLegend = await filterDivEnum.findElement(By.css('fieldset legend'));
      const filterDivEnumName: string = await filterDivEnumLegend.getText();

      await this.driver.manage().setTimeouts({ implicit: 1500 });
      const filterEnumFieldsetDivs = await filterDivEnum.findElements(By.css('fieldset > div > div'));

      for (const fieldsetDiv of filterEnumFieldsetDivs) {
        const moreSpans = await fieldsetDiv.findElements(By.css('span[tabindex="0"]'));

        for (const moreSpan of moreSpans) {
          const actions = this.driver.actions({ async: true });
          await this.driver.actions().scroll(0, 0, 0, 0, moreSpan).perform();
          await actions.move({ origin: moreSpan }).click().perform();
          await this.driver.manage().setTimeouts({ implicit: 1000 });
        }
      }

      const filterEnumValueDivs = await filterDivEnum
        .findElements(By.css(
          'fieldset div[data-baobab-name="FilterValue"]'
        ));
      const filterValues: string[] = [];

      for (const filterEnumValueDiv of filterEnumValueDivs) {
        try {
          const filterEnumValue: string = await filterEnumValueDiv.getText();
          filterValues.push(filterEnumValue);
        } catch (err) {
          break;
        }
      }

      if (filterDivEnumName && filterValues.some((value: string) => !!value)) {
        filters.push({
          name: filterDivEnumName,
          type: 'enum',
          value: filterValues
        });
      }
    }

    return filters;
  }

  private async setFilters(categories1Level: any[]): Promise<void> {
    let index: number = 0;
    let attemptsToGetUrl: number = 0;
    const array = [...this.category3LevelLinks];
    while (index < array.length && attemptsToGetUrl < this.MAX_ATTEMPTS_TO_GET_URL) {
      await this.setCookies();
      await this.driver.get(array[index]);

      await this.driver.manage().setTimeouts({ implicit: 1000 });

      //TODO: не у всех категорий 3 уровня сразу есть товары, у кого-то мб езе категории внутри
      try {
        const breadcrumb = await this.driver.findElements(By.css('ol[itemscope] li'));
        const category1LevelName: string = await breadcrumb[0].getText();
        const category2LevelName: string = await breadcrumb[1].getText();
        const category3LevelName: string = await breadcrumb[2].getText();

        const category1Level: any = categories1Level.find((item: any) => item.name === category1LevelName);
        const category2Level: any = category1Level?.categories2Level
          ?.find((item: any) => item.name === category2LevelName);
        const category3Level: any = category2Level?.categories3Level?.find((item: any) =>
          item.name.toLowerCase().includes(category3LevelName.toLowerCase())
          || category3LevelName.toLowerCase().includes(item.name.toLowerCase()));

        if (category3Level) {
          const filters = await this.getFilters();
          category3Level.filters = filters;

          //добавление ссылок на товары в этой категории
          const links: string[] = [];
          const productBlocks = await this.driver.findElements(By.css('div[data-baobab-name="$main"]'));
          const productArticles = await productBlocks[0].findElements(By.css('article'));
          let count = 0;

          for (let i = 0; i < productArticles.length && count < 5; ++i) {
            const productA = await productArticles[i].findElement(By.css('a[data-baobab-name="title"]'));
            const productLink: string = await productA.getAttribute('href');
            links.push(productLink);

            ++count;
          }

          this.productsMap.set({
            category1LevelName,
            category2LevelName,
            category3LevelName
          }, links);
        }

        ++index;
        attemptsToGetUrl = 0;
      } catch (err) {
        ++attemptsToGetUrl;
      }
    }
  }

  private async getCategories1Level(): Promise<any[]> {
    const categories1Level: any[] = [];
    const category1LevelLis = await this.driver.findElements(By.css('ul[role="tablist"]:first-child li'));
    //TODO: убрать count
    let count = 0;
    let count3Level = 0;
    for (const category1LevelLi of category1LevelLis) {
      const actions = this.driver.actions({ async: true });
      await actions.move({ origin: category1LevelLi }).perform();

      await this.clickAllMoreSpans();

      const category1LevelA = await this.driver.findElement(By.css('div[role="heading"] > a'));
      const category1LevelName = await category1LevelA.getText();


      if (category1LevelName !== 'Скидки' && category1LevelName !== 'Ресейл' && count <= 3 && count > 2) {
        const category1Level = {
          name: category1LevelName,
          categories2Level: []
        };

        const category2LevelDivs = await this.driver
          .findElements(By.css(
            'div[role="heading"] div div[data-auto="category"]'
          ));

        for (const category2LevelDiv of category2LevelDivs) {
          const category2LevelDivHeading = await category2LevelDiv.findElement(By.css('div[role="heading"]'));
          //при переборе не получает элемент
          const category2LevelName = await category2LevelDivHeading.getText();
          const category2Level = {
            name: category2LevelName,
            categories3Level: []
          };

          const categories3LevelDivs = await category2LevelDiv
            .findElements(By.css(
              'ul[data-autotest-id="subItems"] li > div'
            ));

          if (categories3LevelDivs) {
            for (const categories3LevelDiv of categories3LevelDivs) {
              const category3LevelA = await categories3LevelDiv.findElement(By.css('a'));

              if (count3Level < 4) {
                const category3LevelLink = await category3LevelA.getAttribute('href');
                this.category3LevelLinks.add(category3LevelLink);
              }

              const category3LevelName = await categories3LevelDiv.getText();
              category2Level.categories3Level.push({
                name: category3LevelName,
                filters: []
              });

              ++count3Level;
            }
          }

          category1Level.categories2Level.push(category2Level);
        }
        categories1Level.push(category1Level);
      }
      ++count;
    }

    return categories1Level;
  }

  public async scrape(): Promise<any[]> {
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
      await this.setFilters(categories1Level);

      await this.driver.quit();
    }

    return categories1Level;
  }
}