import { Injectable } from '@nestjs/common';
import { By } from 'selenium-webdriver';
import { BaseScrapingService } from './base-scraping.service';

interface BreadcrumbInfo {
  [key: string]: string,
  category1LevelName: string,
  category2LevelName: string,
  category3LevelName: string,
}

@Injectable()
export class ProductScrapingService extends BaseScrapingService {
  //TODO: убрать все any
  private async getCharacteristics(): Promise<any[]> {
    const characteristics: any[] = [];
    const characteristicsDls = await this.driver.findElements(By.css('dl[id]'));
    for (const characteristicDl of characteristicsDls)  {
      const dt = await characteristicDl.findElement(By.css('dt'));
      const dd = await characteristicDl.findElement(By.css('dd'));

      const dtText: string = await dt.getText();
      const ddText: string = await dd.getText();

      let value: string | number = '';

      const valueFloat: number = Number.parseFloat(ddText);
      const valueInt: number = Number.parseInt(ddText);

      if (!isNaN(valueFloat) && valueFloat.toString().length === ddText.length) {
        value = valueFloat;
      } else if (!isNaN(valueInt) && valueInt.toString().length === ddText.length) {
        value = valueInt;
      } else {
        value = ddText;
      }
      
      const characteristic: any = {
        name: dtText,
        value
      };

      characteristics.push(characteristic);
    }

    return characteristics;
  }

  private async getProduct(
    offerDiv: any, 
    info: BreadcrumbInfo, 
    name: string, 
    description: string, 
    characteristics: any[], 
    imagePath: string
  ): Promise<any> {
    //TODO: не у всех предложений название магазина представлено текстом, у кого-то картинкой
    const offerLinksA = await offerDiv.findElements(By.css('a[data-zone-name="offerLink"]'));
    const shopName: string = await offerLinksA[1].getText();
    
    const priceSpan = await offerDiv.findElement(By.css('span[data-auto="mainPrice"] span'));
    const price: string = await priceSpan.getText();
    const priceInt: number = parseInt(price.replaceAll(' ', ''));

    const product: any = {
      categoryInfo: info,
      name,
      description,
      characteristics,
      imagePath,
      shopName,
      price: priceInt
    };

    return product;
  }

  private async getProductsByCategory(info: BreadcrumbInfo): Promise<any[]> {
    const products: any[] = [];

    const productActionsA = await this.driver.findElements(By.css('div[data-baobab-name="$productActions"] a'));

    await this.setCookies();
    //нажатие на раздел "Характеристики"
    let actions = this.driver.actions({ async: true });
    await actions.move({ origin: productActionsA[1] }).click().perform();

    const productNameH1 = await this.driver.findElement(By.css('h1[data-baobab-name="$name"]'));
    const productName: string = await productNameH1.getText();
    
    const productDescriptionDiv = await this.driver
      .findElement(By.css(
        'div[data-auto="product-full-specs"] div:not([class])'
      ));
    const productDescription: string = await productDescriptionDiv.getText();

    const productImageA = await this.driver.findElement(By.css('div[data-zone-name="picture"] img'));
    const productImagePath: string = await productImageA.getAttribute('src');

    const characteristics: any[] = await this.getCharacteristics();
    //TODO: вариант, что может не быть офферов, или вариант, 
    //что нет кнопки показать предложения, тк предложений в целом немного
    const allOffersA = await this.driver.findElement(By.css('div[data-auto="topOffers"] > div > div > a'));
    await this.setCookies();
    //нажатие на "Все предложения"
    actions = this.driver.actions({ async: true });
    await actions.move({ origin: allOffersA }).click().perform();
    await this.driver.manage().setTimeouts( { implicit: 1000 } );

    const offerDivs = await this.driver.findElements(By.css('div[data-zone-name="OfferSnippet"]'));

    for (const offerDiv of offerDivs) {
      const product: any = 
        await this.getProduct(offerDiv, info, productName, productDescription, characteristics, productImagePath);

      products.push(product);
    }

    return products;
  }

  private async getProducts(productsMap: Map<BreadcrumbInfo, string[]>): Promise<any[]> {
    const products: any[] = [];

    // eslint-disable-next-line array-bracket-newline
    for (const [info, links] of productsMap) {
      let index: number = 0;
      let attemptsToGetUrl: number = 0;

      while (index < links.length && attemptsToGetUrl < this.MAX_ATTEMPTS_TO_GET_URL) {
        await this.setCookies();
        await this.driver.get(links[index]);
        
        await this.driver.manage().setTimeouts( { implicit: 1000 } );
  
        try {
          const productsByCategory: any[] = await this.getProductsByCategory(info);
          products.push(...productsByCategory);

          ++index;
          attemptsToGetUrl = 0;
        } catch (err) {
          ++attemptsToGetUrl;
        }
      }
    }

    return products;
  }

  public async scrape(productsMap: Map<BreadcrumbInfo, string[]>): Promise<any[]> {
    let products: any[] = [];

    await this.initializeDriver();

    if (this.driver) {
      await this.driver.get('https://market.yandex.ru/');
      await this.setCookies();

      //TODO: Есть вайбы, что все равно страница редиректит даже если нет капчи
      if (this.isShowedCaptcha()) {
        await this.driver.get('https://market.yandex.ru/');
      }

      products = await this.getProducts(productsMap);
      
      await this.driver.quit();
    }
    return products;
  }
}