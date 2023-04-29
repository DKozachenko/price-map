import { Logger, OnModuleInit } from '@nestjs/common';
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Product, Shop } from '@core/entities';
import { DeleteResult, In, Repository } from 'typeorm';
import { catchError, forkJoin, from, Observable, of, switchMap, throwError, zip } from 'rxjs';
import { ICoordinates, IPriceQuery, IProductQuery, IUserFilter } from '@core/interfaces';
import { RabbitService } from '../../../services';
import { DbErrorCode, RabbitErrorCode } from '@core/types';
import { CategoriesService } from '../../categories/services';
import { IProductIdShopMatch, IProductWithNames } from '../models/interfaces';
import { ShopsService } from '../../shops/services';
import { PRODUCTS_QUEUE, SHOPS_IN_QUEUE } from '../../../models/constants';
import { IMessage } from '../../../models/interfaces';

/**
 * Сервис товаров
 * @export
 * @class ProductsService
 */
@Injectable()
export class ProductsService implements OnModuleInit {
  /**
   * Репозиторий товаров
   * @private
   * @type {Repository<Product>}
   * @memberof ProductsService
   */
  @InjectRepository(Product, 'postgresConnect')
  private readonly productRepository: Repository<Product>;

  constructor(private readonly rabbitService: RabbitService,
    private readonly categoriesService: CategoriesService,
    private readonly shopsService: ShopsService) {}

  public onModuleInit(): void {
    this.subscribeOnProductsAndShopsQueues();
  }

  /**
   * Подписка на очереди для товаров и магазинов
   * @private
   * @memberof ProductsService
   */
  private subscribeOnProductsAndShopsQueues(): void {
    const errorCodes: (RabbitErrorCode | DbErrorCode)[] = [
      'DB_ERROR',
      'GET_MESSAGE_ERROR'
    ];

    let errorCode: RabbitErrorCode | DbErrorCode = 'GET_MESSAGE_ERROR';

    zip(
      this.rabbitService.getMessage<IProductWithNames[]>(PRODUCTS_QUEUE),
      this.rabbitService.getMessage<IProductIdShopMatch[]>(SHOPS_IN_QUEUE)
    )
      .pipe(
        switchMap(([
          productsMessage,
          shopsMessage
        ] : [
          IMessage<IProductWithNames[]>,
          IMessage<IProductIdShopMatch[]>
        ]) => {
          return this.refreshProductsAndShopsData(productsMessage.data, shopsMessage.data)
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            );
        }),
        catchError((err: Error) => {
          Logger.error(`Error code: ${errorCode}, queue: ${PRODUCTS_QUEUE}, ${err}`, 'ProductsService');
          return of(null);
        })
      )
      .subscribe((products: Product[] | null) => {
        if (products) {
          Logger.log(`Successfully saving ${products.length} products`, 'ProductsService');
        }
      });
  }

  /**
   * Сохранение данных для товаров и магазинов (удаление, сохранение по новой и связь между товаром и магазином)
   * @private
   * @param {IProductWithNames[]} productsWithNames товары с названиями категории и товара
   * @param {IProductIdShopMatch[]} matches сопоставления
   * @return {*}  {Observable<Product[]>} сохраненные товары
   * @memberof ProductsService
   */
  private refreshProductsAndShopsData(productsWithNames: IProductWithNames[], matches: IProductIdShopMatch[]):
    Observable<Product[]> {
    // Удаление всех товаров
    return this.deleteAll()
      .pipe(
        switchMap((affectedRows: number) => {
          Logger.warn(`Deleting products: ${affectedRows} rows`, 'ProductsService');

          // Удаление всех магазинов
          return this.shopsService.deleteAll();
        }),
        switchMap((affectedRows: number) => {
          Logger.warn(`Deleting shops: ${affectedRows} rows`, 'ProductsService');

          const shopsToSave: Shop[] = this.getUniqueShops(matches);

          // Сохранеие магазинов и получение всех категорий 3 уровня
          return forkJoin([
            this.shopsService.saveAll(shopsToSave),
            this.categoriesService.getAllCategories3Level()
          ]);
        }),
        switchMap(([
          shops,
          categories3Level
        ]: [
          Shop[],
          Category3Level[]
        ]) => {
          const productsForSave: Product[] = [];
          for (const product of productsWithNames) {
            const existedCategory3Level: Category3Level | undefined
              = categories3Level.find((item: Category3Level) => item.name === product.category3LevelName);

            const match: IProductIdShopMatch | undefined
              = matches.find((item: IProductIdShopMatch) => item.productId === product.id);
            const existedShop: Shop | undefined = shops.find((item: Shop) => item.id === match?.shop?.id);

            if (existedCategory3Level && existedShop) {
              productsForSave.push({
                id: product.id,
                name: product.name,
                description: product.description,
                imagePath: product.imagePath,
                price: product.price,
                characteristics: product.characteristics,
                category3Level: existedCategory3Level,
                shop: existedShop,
                users: []
              });
            }
          }

          // Сохранение товаров
          return this.save(productsForSave);
        })
      );
  }


  /**
   * Получение уникальных магазинов
   * @private
   * @param {IProductIdShopMatch[]} matches сопоставления id товара и магазина
   * @return {*}  {Shop[]} магазины
   * @memberof ProductsService
   */
  private getUniqueShops(matches: IProductIdShopMatch[]): Shop[] {
    const result: Shop[] = [];
    for (const match of matches) {
      const existedShop: Shop | undefined = result.find((shop: Shop) => shop.id === match.shop.id);
      if (!existedShop) {
        result.push(match.shop);
      }
    }

    return result;
  }

  /**
   * Генерация для условия IN
   * @private
   * @param {string[]} category3LevelIds id категорий 3 уровня
   * @return {*}  {string} выражение для условия
   * @memberof ProductsService
   */
  private generateInQuery(category3LevelIds: string[]): string {
    let result = 'p."category3LevelId" IN(';
    for (let i = 0; i < category3LevelIds.length; ++i) {
      if (i === category3LevelIds.length - 1) {
        result += `'${category3LevelIds[i]}'`;
      } else {
        result += `'${category3LevelIds[i]}', `;
      }
    }
    return result + ')';
  }

  /**
   * Генерация условия для JSON значения
   * @private
   * @param {IUserFilter} filter фильтр
   * @return {*}  {string} условное выражение
   * @memberof ProductsService
   */
  private generateJsonValueCondition(filter: IUserFilter): string {
    const result = 'characteristics.value';
    switch (filter.type) {
      case 'enum':
        let inQuery: string = '(';
        for (let i = 0; i < (<number[] | string[]>filter.value).length; ++i) {
          if (i === (<number[] | string[]>filter.value).length - 1) {
            inQuery += `'${filter.value[i]}')`;
          } else {
            inQuery += `'${filter.value[i]}', `;
          }
        }

        return `${result} IN ${inQuery}`;
      case 'boolean':
        return `${result}::boolean = ${ filter.value ? 'true' : 'false' }`;
      case 'range':
        if (filter.value[0] && filter.value[1]) {
          return `${result}::float >= ${filter.value[0]} AND ${result}::float <= ${filter.value[1]}`;
        } else if (!filter.value[0] && filter.value[1]) {
          return `${result}::float <= ${filter.value[1]}`;
        } else if (filter.value[0] && !filter.value[1]) {
          return `${result}::float >= ${filter.value[0]}`;
        } else {
          return `${result} IS NOT NULL`;
        }
      default:
        return '';
    }
  }

  /**
   * Генерация SQL-кода для WITH таблицы
   * @private
   * @param {IProductQuery} query запрос
   * @return {*}  {string} SQL-код для WITH
   * @memberof ProductsService
   */
  private generateWithSql(query: IProductQuery): string {
    let fromQuery = '';
    for (let i = 0; i < query.filters.length; ++i) {
      const filter = query.filters[i];
      const valueQuery: string = this.generateJsonValueCondition(filter);

      if (i === query.filters.length - 1) {
        fromQuery += `SELECT p."id"
        FROM "Products" p, jsonb_to_recordset(p."characteristics") AS characteristics(name text, value text)
        WHERE p."category3LevelId" = '${query.category3LevelIds[0]}'
        AND characteristics.name = '${filter.name}' and ${valueQuery}`;
      } else {
        fromQuery += `
        SELECT p."id"
        FROM "Products" p, jsonb_to_recordset(p."characteristics") AS characteristics(name text, value text)
        WHERE p."category3LevelId" = '${query.category3LevelIds[0]}'
        AND characteristics.name = '${filter.name}' and ${valueQuery}
        INTERSECT
        `;
      }
    }

    return `WITH approachIds AS (${fromQuery}
  )`;
  }

  /**
   * Генерация условия для отбора записей
   * @private
   * @param {IProductQuery} query
   * @return {*}  {string} SQL с условием
   * @memberof ProductsService
   */
  private generateWhereSql(query: IProductQuery): string {
    let whereQuery: string = '';

    //Условия для цены
    if (!query.price.max && !query.price.min) {
      whereQuery = '';
    }
    if (query.price.max && query.price.min) {
      whereQuery = `WHERE p."price" <= ${query.price.max} AND p."price" >= ${query.price.min}`;
    }
    if (query.price.max && !query.price.min) {
      whereQuery = `WHERE p."price" <= ${query.price.max}`;
    }
    if (!query.price.max && query.price.min) {
      whereQuery = `WHERE p."price" >= ${query.price.min}`;
    }

    /* eslint-disable */
    //Условия для радиуса
    if (query.radius.center && query.radius.distance) {
      whereQuery += `${whereQuery ? ' AND ' : 'WHERE '}round((6367 *
        2 * atan2(sqrt(
          power(sin(((${query.radius.center.latitude} - (s."coordinates"->'latitude')::float) * pi() / 180) / 2), 2) +
          cos(((s."coordinates"::jsonb->'latitude')::float) * pi() / 180) * cos(${query.radius.center.latitude}::float * pi() / 180) *
          power(((${query.radius.center.longitude} - (s."coordinates"::jsonb->'longitude')::float) * pi() / 180) / 2, 2)
        ), sqrt(1 -
              power(sin(((${query.radius.center.latitude} - (s."coordinates"::jsonb->'latitude')::float) * pi() / 180) / 2), 2) +
              cos(((s."coordinates"::jsonb->'latitude')::float) * pi() / 180) * cos(${query.radius.center.latitude}::float * pi() / 180) *
              power(((${query.radius.center.longitude} - (s."coordinates"::jsonb->'longitude')::float) * pi() / 180) / 2, 2)
             ))) * 1000)::int <= ${query.radius.distance}
      `;
    /* eslint-enable */
    }

    //Условия для категорий 3 уровня
    if (query.category3LevelIds.length) {
      whereQuery += `${whereQuery ? ' AND ' : 'WHERE '}${this.generateInQuery(query.category3LevelIds)}`;
    }

    // Условия для поиска только среди избранного пользователя
    if (query.userId) {
      whereQuery += `${whereQuery ? ' AND ' : 'WHERE '}p."id" in (
        select "productsId"
        from "UserProducts" up
        where up."usersId" = '${query.userId}'
      )`;
    }
    return whereQuery;
  }


  /**
   * Генерация SQL скрипта для отбора товаров с наличием фильтров по категории
   * @private
   * @param {IProductQuery} query запрос
   * @return {*}  {string} SQL скрипт
   * @memberof ProductsService
   */
  private generateSqlWithFilters(query: IProductQuery): string {
    const withSql: string = this.generateWithSql(query);
    const whereSql: string = this.generateWhereSql(query);
    return `${withSql}
    SELECT p."id", p."name", p."description", p."price", p."characteristics", p."imagePath",
    json_build_object('id', s."id", 'name', s."name", 'osmNodeId', s."osmNodeId", 'website',
    s."website", 'coordinates', s."coordinates") AS shop,
    json_build_object('id', cl."id", 'name', cl."name", 'filters', cl."filters") AS category3Level
    FROM approachIds
    INNER JOIN "Products" p ON approachIds."id" = p."id"
    INNER JOIN "Shops" s ON p."shopId" = s."id"
    INNER JOIN "Categories3Level" cl ON p."category3LevelId" = cl."id"
    ${whereSql ? whereSql : ''};`;
  }

  /**
   * Генерация SQL скрипта для отбора товаров без фильтров по категории
   * @private
   * @param {IProductQuery} query запрос
   * @return {*}  {string} SQL скрипт
   * @memberof ProductsService
   */
  private generateSqlWithoutFilters(query: IProductQuery): string {
    const whereSql: string = this.generateWhereSql(query);
    return `SELECT p."id", p."name", p."description", p."price", p."characteristics", p."imagePath",
    json_build_object('id', s."id", 'name', s."name", 'osmNodeId', s."osmNodeId", 'website',
    s."website", 'coordinates', s."coordinates") AS shop,
    json_build_object('id', cl."id", 'name', cl."name", 'filters', cl."filters") AS category3Level
    FROM "Products" p
    INNER JOIN "Shops" s ON p."shopId" = s."id"
    INNER JOIN "Categories3Level" cl ON p."category3LevelId" = cl."id"
    ${whereSql ? whereSql : ''};`;
  }

  /**
   * Получение всех товаров
   * @param {IProductQuery} query запрос для товаров
   * @return {*}  {Observable<Product[]>} товары
   * @memberof ProductsService
   */
  public getAll(query: IProductQuery): Observable<Product[]> {
    if (!query.category3LevelIds.length
        && !query.filters.length
        && !query.price.max
        && !query.price.min
        && !query.radius.center
        && !query.radius.distance
        && !query.userId) {
      return of([]);
    }
    const sqlQuery: string = query.filters.length
      ? this.generateSqlWithFilters(query)
      : this.generateSqlWithoutFilters(query);

    return from(this.productRepository.query(sqlQuery));
  }


  /**
   * Получение товара по id
   * @param {string} id id
   * @return {*}  {Observable<Product | null>} товар
   * @memberof ProductsService
   */
  public getById(id: string): Observable<Product | null> {
    return from(this.productRepository.findOne({
      where: {
        id
      },
      relations: {
        shop: true,
        category3Level: true
      }
    }));
  }

  /**
   * Сохранение товаров (со связанными категорией и магазином)
   * @param {((Omit<Product, 'id' | 'shop'>)[])} products товары
   * @return {*}  {Observable<Product[]>} сохраненные товары
   * @memberof ProductsService
   */
  public save(products: Product[]): Observable<Product[]> {
    return from(this.productRepository.save(products));
  }

  /**
   * Удаление всех товаров
   * @return {*}  {Observable<number>} кол-во затронутых строк
   * @memberof ProductsService
   */
  public deleteAll(): Observable<number> {
    return from(this.productRepository.delete({}))
      .pipe(
        switchMap((result: DeleteResult) => of(result.affected))
      );
  }

  /**
   * Получение диапазона цен товаров (минимальная и максимальные цены)
   * @return {*}  {Observable<IPriceQuery>} диапазон цен
   * @memberof ProductsService
   */
  public getPriceRange(): Observable<IPriceQuery> {
    return forkJoin([
      from(this.productRepository.query('SELECT MIN(price) AS price FROM "Products" p;')),
      from(this.productRepository.query('SELECT MAX(price) AS price FROM "Products" p;')),
    ])
      .pipe(
        switchMap(([
          minArr,
          maxArr
        ]:[
          { price: number }[],
          { price: number }[]
        ]) => of({
          min: minArr[0]?.price,
          max: maxArr[0]?.price
        }))
      );
  }

  /**
   * Получение нескольких товаров по id
   * @param {string[]} ids массив id
   * @return {*}  {Observable<Product[]>} товары
   * @memberof ProductsService
   */
  public getByIds(ids: string[]): Observable<Product[]> {
    return from(this.productRepository.find({
      where: {
        id: In(ids)
      },
      relations: {
        shop: true,
        category3Level: true
      }
    }));
  }

  /**
   * Создание строки с координатами через запятую
   * @private
   * @param {ICoordinates[]} coordinates координатами
   * @return {*}  {string} коодинаты через запятую (в формате {longitude},{latitude})
   * @memberof ProductsService
   */
  public createCoordinatesQuery(coordinates: ICoordinates[]): string {
    let result = '';
    for (let i = 0; i < coordinates.length; ++i) {
      if (i === coordinates.length - 1) {
        result += `${coordinates[i].longitude},${coordinates[i].latitude}`;
      } else {
        result += `${coordinates[i].longitude},${coordinates[i].latitude};`;
      }
    }

    return result;
  }
}
