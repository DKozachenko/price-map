import { InjectRepository } from '@nestjs/typeorm';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
} from '@nestjs/websockets';
import { Observable, of } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { BaseEntity } from '../../../models/test.entity';
import * as https from 'https';
import { Builder, Browser, By, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
const fs = require('fs');

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  @InjectRepository(BaseEntity)
  private readonly repository: Repository<BaseEntity>;

  public async getInfo(driver, url) {
    await driver.get(url)
    const name = await driver.findElement(By.css, 'h1[data-baobab-name="$name"]').getText()
    const price = await driver.findElement(By.css, 'div[data-baobab-name="price"] h3 span:nth-child(2)').getText()
    const raiting = await driver.findElement(By.css, 'div[data-baobab-name="$productActions"] div div span:nth-child(2)').getText()
  }
    

  public async drive() {
    console.time()
    const categories: any[] = []

    let opts = new chrome.Options();
    opts.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36")
    opts.addArguments('ignore-certificate-errors')

    const service = new chrome.ServiceBuilder('C:/Users/kozac/Downloads/chromedriver_win32/chromedriver.exe');
    const driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(opts).setChromeService(service).build();
    await driver.manage().window().maximize();

    await driver.get('https://market.yandex.ru/');
    await (driver.manage() as any).addCookie({name: "_yasc", value: "It7+VfsAEkQQ6+5y2bY/39GDw+x4bK4FrjdHSH6JvdMjCBSKxfB8kOXBcyhvAiVUYYQ=", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "_ym_d", value: "1669101421/yQUXLkON7IOuAkzlnLOutwD3Q", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "_ym_isad", value: "2", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "_ym_uid", value: "1664609197646862615", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "_ym_visorc", value: "b", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "bnpl_limit", value: "200000", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "cmp-merge", value: "true", domain: ".market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "currentRegionId", value: "65", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "currentRegionName", value: "%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "fetch_loyalty_notifications_time_stamp", value: "2022-11-22T07:48:18.217Z", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "gdpr", value: "0", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "is_gdpr", value: "0", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "is_gdpr_b", value: "CMyzPRDqlgE=", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "js", value: "1", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "mOC", value: "1", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "nec", value: "0", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "parent_reqid_seq", value: "1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500%2C1669101443600%2Ff8c4170b15d711bb47d1a3f609ee0500", domain: ".market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "reviews-merge", value: "true", domain: ".market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "session_server_request_id_market:product/product--futbolka-suvenirshop-ghostbuster-gostbaster-maslennikov/1750369481", value: "1669101426989%2Fd6d0199893ed1daa275ba6f509ee0500", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "spravka", value: "dD0xNjY5MTAzMjQyO2k9MTc4LjQ5LjI1My4yMjM7RD1GRDMzOENFRkM2RUJEQTlEMTE0OUM3MTQwNDhCOTQ1MDQyNUI0MDBFOERDNjJCODhDNEEwMUZERTZFMDQ5QTY4MTI3NkU3QzY7dT0xNjY5MTAzMjQyODk3NDY3NDIxO2g9NGUwM2I5OGI4M2FkMTRmMzNmMmU4Mzg4OTRjNjc5MTA=", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "skid", value: "3271347601669101427", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "ugcp", value: "1", domain: "market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "visits", value: "1669103160-1669103160-1669103160", domain: ".market.yandex.ru"});
    await (driver.manage() as any).addCookie({name: "yandexuid", value: "96788151669101421", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "ymex", value: "1984461421.yrts.1669101421#1984461421.yrtsi.1669101421", domain: ".yandex.ru"});
    await (driver.manage() as any).addCookie({name: "yuidss", value: "96788151669101421", domain: ".yandex.ru"});

    try {
      const name = await driver.findElement(By.css('h1[data-baobab-name="$name"]'))
      console.log(name)
    }
    catch (e) {
      await driver.get('https://market.yandex.ru/product--futbolka-suvenirshop-ghostbuster-gostbaster-maslennikov-chernaia-3xl/1750369481?glfilter=14871214%3A14899090_101729037139&glfilter=25911110%3AM1hMICg1Ni01OCk_101729037139&cpa=1&cpc=WlI4woY17JRyaVZJzsxsxL2Nd1Ox8SS8KbLpvmAmN4G5BL9r1zijfSQiwPFt4OyUfVnUXrHk0At50AHMRXFAYLW5Oq4h1zEV6-38wEhrevG2-i6jSYVba6SVKoEpNqRMl6j4RU7gDy24g9brG4mkgRfpsRbgW2pkr_dZ6y8JShWZCroJcgBr5jMYDayW7Q6y&sku=101729037139&offerid=yHDwl3-Ma7MjRqq6RELdXQ');
      let actions = driver.actions({ async: true });
      

      const popupButton = await driver.findElement(By.id('catalogPopupButton'));
      await actions.move({ origin: popupButton }).click().perform();

      //ожидание пока прогрузится меню
      let ele = await driver.wait(until.elementLocated(By.css('div[data-zone-name="catalog-content"]')), 10000);

      const elements = await driver.findElements(By.css('ul[role="tablist"]:first-child li'));
 
      for (const cat1 of elements) {
        actions = driver.actions({ async: true });
        await actions.move({ origin: cat1 }).perform();

        // #кликаем на все еще
        const moreSpans = await driver.findElements(By.css('div[role="heading"] div div[data-auto="category"] ul[data-autotest-id="subItems"] li > span'))
        for (const span of moreSpans) {
          actions = driver.actions({ async: true });
          await actions.move({ origin: span }).click().perform();
        }
        // await new Promise(resolve => setTimeout(resolve, 133000));
        
        const category1Level = await driver.findElement(By.css('div[role="heading"] > a'));
        const category1LevelName = await category1Level.getText();
        const category1LevelObj = {
          name: category1LevelName,
          children: []
        }
        console.log(category1LevelName)

        const categories2Level = await driver.findElements(By.css('div[role="heading"] div div[data-auto="category"]'))
        
        for (const category of categories2Level) {
          const cat = await category.findElement(By.css('div[role="heading"]'));
          const catName = await cat.getText()
          const category2LevelObj = {
            name: catName,
            children: []
          }

          console.log('\t', catName)

          const categories3Level = await category.findElements(By.css('ul[data-autotest-id="subItems"] li > div'))

          if (categories3Level) {
            for (const cat3 of categories3Level) {
              const cat3Name = await cat3.getText();
              console.log('\t\t', cat3Name);
              category2LevelObj.children.push({
                name: cat3Name
              })
            }
          }
          
          category1LevelObj.children.push(category2LevelObj)
          console.log('-------')
        }

        categories.push(category1LevelObj)
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    await driver.quit();

    // fs.writeFile('test.json', JSON.stringify(categories), function (err) {
    //   if (err) return console.log(err);
    // });
    // console.log(categories)
    console.timeEnd()
    return categories;
  }
  

  public readURL(url) {
    const options = {
      hostname: 'market.yandex.ru',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        acceptEncoding: 'gzip, deflate, br',
        acceptLanguage: 'ru,ru-RU;q=0.9,en-US;q=0.8,en;q=0.7,zh;q=0.6',
        cacheControl: 'no-cache',
        cookie: 'yuidss=3890917711664608778; yandexuid=3890917711664608778; is_gdpr=0; gdpr=0; _ym_uid=1664609197646862615; _ym_d=1664609198; device_id=b0ebd232b5f35d163f29479c164e7d67026402387; skid=8013247771664779555; js=1; currentRegionId=65; currentRegionName=%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D0%B8%D0%B1%D0%B8%D1%80%D1%81%D0%BA; mOC=1; viewtype=grid; _ga=GA1.2.2082354009.1666542569; active-browser-timestamp=1666542606948; yp=1667719358.szm.1:1920x1080:1920x937#1982475634.udn.cDpES296YWNoZW5rbzAwMA%3D%3D; L=XSh5SGZ8dFReXnhBaUlKT35ESGwMSnxnMCM1IhRREjQMJS5xAVc=.1667115634.15146.368550.e31941568020f1d11bcafb55d90833a4; yandex_login=DKozachenko000; nec=1; utm_campaign=2347842; utm_medium=widget; utm_source=partner_network; utm_term=button; ys=udn.cDpES296YWNoZW5rbzAwMA%3D%3D#c_chck.600749601; spravka=dD0xNjY3MTE5MzkwO2k9MTc4LjQ5LjI1My4yMjM7RD05MDJGRkYzM0NDNkU5MDVBNzFCRjczMjYzQTZCNzJBNTM5RTdBMUNGN0NCNzg5OEM1ODY2NTgwNzZGMDdENjdFQjI2NTE3RUU7dT0xNjY3MTE5MzkwNjc5NzkwMDY4O2g9ODk5Yzk2ZGJmNGZhZjMxMmFhMzU3YzZkYjFkZWVjNjY=; cashback_onboarding=1; yandex_help=1; m2b_popover_was_viewed_1476374398=1; m2b_popover_next_step_1476374398=3; is_gdpr_b=CIyaHxCGlAEoAg==; ymex=1979969193.yrts.1664609193#1983193677.yrtsi.1667833677; i=NU+4x2gvgymvnzIl5XnimGcFwIWefCtXzpQvrYL9NM3yDhNKeCsyvfP0eUJOKh/UoDQCduVxx9k2ARR1F5U4yzBlm+k=; cycada=ByAAZbLnWDbFQDAjAk4Y/yvHRNIbN9Ygg15+pkRSGU8=; _ym_isad=2; Session_id=3:1668954535.5.0.1667115634574:3_0xsg:1e.1.2:1|1476374398.0.2|3:10261447.810921.rrfekgR1nmbqvE0jPbfcg3yJB8U; sessionid2=3:1668954535.5.0.1667115634574:3_0xsg:1e.1.2:1|1476374398.0.2|3:10261447.810921.fakesign0000000000000000000; visits=1665667397-1667743239-1668956964; Beko=0; yaplus_BF=0; Commo=0; server_request_id_market:index=1668960429946%2F511b236936204ea25d359221e9ed0500; suppress_order_notifications=1; ugcp=1; bnpl_limit=100000; fetch_loyalty_notifications_time_stamp=2022-11-20T16:07:12.814Z; _yasc=JRK1VUsY2DGQbFLXRYX4tSkd62AVqjEj9eyGu5okNRKxX9BAtyovRYstSnO1acB9VJ2ARh/y7LDgm8Ww; parent_reqid_seq=1668956964492%2F6ad7a53f974f03c710960353e8ed0500%2C1668956974143%2F86c719e3513d3feda6d79653e8ed0500%2C1668957096676%2F27cd57653ca94fa6478de45ae8ed0500%2C1668960429946%2F511b236936204ea25d359221e9ed0500%2C1668960434112%2F5d3bc5f0203ba6e316c7d121e9ed0500',
        pragma: 'no-cache',
        referer: 'https://www.google.com/',
        secChUa: '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        secChUaMobile: '?0',
        secChUaPlatform: '"Windows"',
        secFetchDest: 'document',
        secFetchMode: 'navigate',
        secFetchSite: 'same-origin',
        secFetchUser: '?1',
        upgradeInsecureRequests: '1',
        'User-agent': '*'
      },
    }



  // возвращаем Promise - так как операция чтения может длиться достаточно долго
    return new Promise((resolve, reject) => {
      // встроенный в NodeJS модуль https
      // первый аргумент - url, второй - callback c параметром ответа сервера

      const req = https.request(options, (res) => {
        // получаем статус ответа сервера посредством деструктуризации объекта
        const { statusCode } = res;
        

        let error;
        if (statusCode !== 200) {
            error = new Error(`Ошибка запроса. Код ответа: ${statusCode}`);
        }


        // при ошибке очищаем память и выходим
        if (error) {

            reject(error);
            res.resume();
            return;
        }
        

        // устанавливаем кодировку
        res.setEncoding('utf8');

        // собираем данные в строку
        let rawData = '';
        res.on('data', chunk => rawData += chunk);

        // после получения всех данных успешно завершаем Промис
        res.on('end', () => resolve(rawData));
      }).on('error', (e) => reject(e)); // ошибка -> отклоняем Промис

      req.end()
    })
  }

  public async createEnt(): Promise<BaseEntity> {
    const user: BaseEntity = new BaseEntity();
    user.name = 'name 1' + Math.random();
    user.description = 'desc';

    return this.repository.save(user);
  }

  public async find() {
    const ent = await this.repository.findOneBy({
      name: 'name 1',
      description: 'description'
    })
    return ent;
  }

  public async create(): Promise<BaseEntity> {
    const newEnt = new BaseEntity();
    newEnt.name = 'name 1';
    newEnt.description = 'description';

    return await this.repository.save(newEnt);
  }

  public afterInit(server: any) {
    // const url = 'http://books.toscrape.com/';
    // const url = 'https://novosibirsk.shops-prices.ru';
    // const url = 'sravni.com';
    // const url = 'https://book24.ru/';
    // const url = 'market.yandex.ru/product--mnogorazovyi-umnyi-bloknot-sketchbuk-bloknot-tvorcheskii-dlia-zapisei-vechnyi-bloknot/1699008846?glfilter=14871214%3A14899090_101345093882&cpc=HEJYghj2a2K8y1tTOyHhI7GloL9hdAvotmbStwukf1QMvQo1IQZoui9tgKcMjGJNA2Zs8r_KQoXmk1MJtlUsJXOgD5NyTEvijBdChA3ew4FEDLjtYyd28dRRLwF35dPGibZwYvXypHpNKkD-BrJiw6ZFIXmXacy0gol8J9BrAcHXJI2raq5XjjbezESFFzVLNONC-B03o-c%2C&from-show-uid=16690400159917681397500001&sku=101345093882&do-waremd5=WRChxNBDP-e7a-TtCnWZtw&sponsored=1&cpa=1';
    // const regexCAtegories3Level : RegExp = new RegExp('<li class="blist"><a href="\/[a-z-]+">[А-ЯA-Z]{1}[a-zа-я ]+<\/a><\/li>', 'g');
    // const regexCAtegories2Level : RegExp = new RegExp('<li><a href="\/[a-z- \/]+">[А-ЯA-Z]{1}[a-zа-яА-Я ]+<\/a><\/li>', 'g');
    // this.readURL(url)
    //   .then((data: string) => {
    //       console.log(data)
    //     }
    //   )
    //   .catch(err =>
    //     console.log(err.message)
    //   )
    // this.drive().then((data) => console.log(data))
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECTED')
  }

  @SubscribeMessage('send')
  public async handleMessage(@MessageBody() data: string): Promise<WsResponse<BaseEntity>> {
    const data2 = await this.getPic();
    console.log(data2)

    console.log(data)
    const newEnt = await this.create();
    const ent = await this.find();
    return { event: 'send', data: ent };
  }
}


