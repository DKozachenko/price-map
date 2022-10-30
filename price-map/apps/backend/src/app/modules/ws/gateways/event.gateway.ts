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

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayInit, OnGatewayConnection {
  @InjectRepository(BaseEntity)
  private readonly repository: Repository<BaseEntity>;

  public readURL(url) {
  
  // возвращаем Promise - так как операция чтения может длиться достаточно долго
    return new Promise((resolve, reject) => {
      // встроенный в NodeJS модуль https
      // первый аргумент - url, второй - callback c параметром ответа сервера

      https.get(url, (res) => {
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
    const url = 'https://novosibirsk.shops-prices.ru';
    // const url = 'https://sravni.com/';
    // const url = 'https://book24.ru/';
    const regexCAtegories3Level : RegExp = new RegExp('<li class="blist"><a href="\/[a-z-]+">[А-ЯA-Z]{1}[a-zа-я ]+<\/a><\/li>', 'g');
    const regexCAtegories2Level : RegExp = new RegExp('<li><a href="\/[a-z- \/]+">[А-ЯA-Z]{1}[a-zа-яА-Я ]+<\/a><\/li>', 'g');
    this.readURL(url)
      .then((data: string) => {
          // console.log(data)
          const liList = data.match(regexCAtegories3Level)
          const categories3Level = [];
          // console.log(liList)

          for (const li of liList) {
            // console.log(li)
            const reg = new RegExp('[А-Я]{1}[а-я]+');
            const category = li.match(reg);
            categories3Level.push(category[0]);
          }

          // console.log(categories3Level);

          const liList2 = data.match(regexCAtegories2Level);
          const categories2Level = [];
          for (const li of liList2) {
            // console.log(li)
            const reg = new RegExp('[А-Я]{1}[а-яА-Я ]+');
            const category = li.match(reg);
            categories2Level.push(category[0]);
          }

          console.log(categories2Level)
        }
        
      )
      .catch(err =>
        console.log(err.message)
      )
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('CONNECTED')
  }

  @SubscribeMessage('send')
  public async handleMessage(@MessageBody() data: string): Promise<WsResponse<BaseEntity>> {
    console.log(data)
    const newEnt = await this.create();
    const ent = await this.find();
    return { event: 'send', data: ent };
  }
}


