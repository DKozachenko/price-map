import { Logger, OnModuleInit } from '@nestjs/common';
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Product } from '@core/entities';
import { Between, DeleteResult, FindOperator, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { catchError, concat, forkJoin, from, Observable, of, switchMap, throwError } from 'rxjs';
import { IPriceQuery, IProductQuery, IUserFilter } from '@core/interfaces';
import { RabbitService } from '../../../services';
import { DbErrorCode, RabbitErrorCode } from '@core/types';
import { CategoriesService } from '../../categories/services';
import { IProductIdShopMatch, IProductWithNames } from '../models/interfaces';
import { ShopsService } from '../../shops/services';
import { PRODUCTS_QUEUE, SHOPS_IN_QUEUE } from '../../../models/constants';

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
    this.subscribeOnProductsQueue();
    this.subscribeOnShopsQueue();
  }

  /**
   * Подписка на очередь с товарами
   * @private
   * @memberof ProductsService
   */
  private subscribeOnProductsQueue(): void {
    const errorCodes: (RabbitErrorCode | DbErrorCode)[] = [
      'DB_ERROR',
      'GET_MESSAGE_ERROR'
    ];

    let errorCode: RabbitErrorCode | DbErrorCode = 'GET_MESSAGE_ERROR';

    this.rabbitService.getMessage<IProductWithNames[]>(PRODUCTS_QUEUE)
      .pipe(
        switchMap((products: IProductWithNames[]) => {
          return forkJoin([
            of(products), 
            this.deleteAll()
          ])
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            );
        }),
        switchMap(([
          products,
          affectedRows
        ]: [
          IProductWithNames[],
          number
        ]) => {
          Logger.warn(`Deleting products: ${affectedRows} rows`, 'ProductsService');
          return forkJoin([
            of(products), 
            this.categoriesService.getAllCategories3Level()
          ])
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            );
        }),
        switchMap(([
          products,
          categories3Level
        ]: [
          IProductWithNames[],
          Category3Level[]
        ]) => {

          const productsForSave: (Omit<Product, | 'shop'>)[] = [];
          for (const product of products) {
            const existedCategory3Level: Category3Level | undefined 
              = categories3Level.find((item: Category3Level) => item.name === product.category3LevelName);
            
            if (existedCategory3Level) {
              productsForSave.push({
                id: product.id,
                name: product.name,
                description: product.description,
                imagePath: product.imagePath,
                price: product.price,
                characteristics: product.characteristics,
                category3Level: existedCategory3Level,
                users: []
              });
            }
          }

          return this.save(productsForSave)
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
      .subscribe((data: Product[] | null) => {
        if (data) {
          Logger.log(`Successfully saving ${data.length} products`, 'ProductsService');
        }
      });
  }

  /**
   * Подписка на очередь для обновления магазинов у товаров
   * @private
   * @memberof ProductsService
   */
  private subscribeOnShopsQueue(): void {
    const errorCodes: (RabbitErrorCode | DbErrorCode)[] = [
      'DB_ERROR',
      'GET_MESSAGE_ERROR'
    ];

    let errorCode: RabbitErrorCode | DbErrorCode = 'GET_MESSAGE_ERROR';

    this.rabbitService.getMessage<IProductIdShopMatch[]>(SHOPS_IN_QUEUE)
      .pipe(
        switchMap((matches: IProductIdShopMatch[]) => {
          return forkJoin([
            of(matches), 
            this.shopsService.deleteAll()
          ])
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            );
        }),
        switchMap(([
          matches,
          affectedRows
        ]: [
          IProductIdShopMatch[],
          number
        ]) => {
          Logger.warn(`Deleting shops: ${affectedRows} rows`, 'ProductsService');
          return this.updateAll(matches)
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            );
        }),
        catchError((err: Error) => {
          Logger.error(`Error code: ${errorCode}, queue: ${SHOPS_IN_QUEUE}, ${err}`, 'ProductsService');
          return of(null);
        })
      )
      .subscribe((data: number | null) => {
        if (data) {
          Logger.log(`Successfully updated ${data} products`, 'ProductsService');
        }
      });
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
        WHERE p."category3LevelId" = '${query.category3LevelIds}'
        AND characteristics.name = '${filter.name}' and ${valueQuery}`;
      } else {
        fromQuery += `
        SELECT p."id"
        FROM "Products" p, jsonb_to_recordset(p."characteristics") AS characteristics(name text, value text)
        WHERE p."category3LevelId" = '${query.category3LevelIds}'
        AND characteristics.name = '${filter.name}' and ${valueQuery}
        INTERSECT
        `;
      }
    }

    return `WITH approachIds AS (${fromQuery}
  )`;
  }

  private generateWhereSql(priceQuery: IPriceQuery): string {
    if (!priceQuery.max && !priceQuery.min) {
      return '';
    }
    if (priceQuery.max && priceQuery.min) {
      return `WHERE p."price" <= ${priceQuery.max} AND p."price" >= ${priceQuery.min}`;
    }
    if (priceQuery.max && !priceQuery.min) {
      return `WHERE p."price" <= ${priceQuery.max}`;
    }

    return `WHERE p."price" >= ${priceQuery.min}`;
  }

  /**
   * Генерация SQL запроса для товаров
   * @private
   * @param {IProductQuery} query запрос
   * @return {*}  {string} SQL-Запрос
   * @memberof ProductsService
   */
  private generateSql(query: IProductQuery): string {
    const withSql: string = this.generateWithSql(query);
    const whereSql: string = this.generateWhereSql(query.price);
    console.log(whereSql);
    return `${withSql}
    SELECT p."id", p."name", p."description", p."price", p."characteristics", p."imagePath",
    json_build_object('id', s."id", 'name', s."name", 'schedule', s."schedule", 'imagePath',
    s."imagePath", 'coordinates', s."coordinates") AS shop,
    json_build_object('id', cl."id", 'name', cl."name", 'filters', cl."filters") AS category3Level
    FROM approachIds
    INNER JOIN "Products" p ON approachIds."id" = p."id"
    INNER JOIN "Shops" s ON p."shopId" = s."id"
    INNER JOIN "Categories3Level" cl ON p."category3LevelId" = cl."id"
    ${whereSql ? whereSql : ''};`;
  }

  /**
   * Получение оператора сравнения для цены
   * @private
   * @param {IPriceQuery} priceQuery запрос для цены
   * @return {*}  {FindOperator<number>} оператор сравнения для ORM
   * @memberof ProductsService
   */
  private getPriceFindOperator(priceQuery: IPriceQuery): FindOperator<number> {
    if (!priceQuery.max && !priceQuery.min) {
      return undefined;
    }
    if (priceQuery.max && priceQuery.min) {
      return Between(priceQuery.min, priceQuery.max);
    }
    if (priceQuery.max && !priceQuery.min) {
      return LessThanOrEqual(priceQuery.max);
    }

    return MoreThanOrEqual(priceQuery.min);
  }

  /**
   * Получение всех товаров в определенных категориях 3 уровня
   * @param {IProductQuery} query запрос для товаров
   * @return {*}  {Observable<Product[]>}
   * @memberof ProductsService
   */
  public getAll(query: IProductQuery): Observable<Product[]> {
    const sqlQuery: string = this.generateSql(query);

    if (query.filters.length) {
      return from(this.productRepository.query(sqlQuery));
    }

    const priceFindOperator: FindOperator<number> = this.getPriceFindOperator(query.price);
    return from(this.productRepository.find({
      where: {
        category3Level: {
          id: In(query.category3LevelIds)
        },
        price: priceFindOperator
      },
      relations: {
        shop: true,
        category3Level: true
      }
    }));
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
  public save(products: (Omit<Product, 'id' | 'shop'>)[]): Observable<Product[]> {
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
   * Обновление всех товаров
   * @param {IProductIdShopMatch[]} matches сопоставление id товаров и магазина
   * @return {*}  {Observable<number>} кол-во затронутых строк
   * @memberof ProductsService
   */
  public updateAll(matches: IProductIdShopMatch[]): Observable<number> {
    const queries: Observable<Product>[] = matches.map((match: IProductIdShopMatch) => from(this.productRepository.save({
      id: match.productId,
      shop: match.shop
    })))

    return concat(queries)
      .pipe(() => of(matches.length));
  }
}
