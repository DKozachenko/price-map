import { Logger, OnModuleInit } from '@nestjs/common';
/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Product } from '@core/entities';
import { Between, DeleteResult, FindOperator, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { catchError, forkJoin, from, Observable, of, switchMap, throwError } from 'rxjs';
import { IPriceQuery, IProductQuery, IUserFilter } from '@core/interfaces';
import { RabbitService } from '../../../services';
import { DbErrorCode, RabbitErrorCode } from '@core/types';
import { CategoriesService } from '../../categories/services';

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
    private readonly categoriesService: CategoriesService) {}

  public onModuleInit(): void {
    let errorCode: RabbitErrorCode | DbErrorCode;

    const errorCodes: (RabbitErrorCode | DbErrorCode)[] = [
      'DB_ERROR',
      'GET_MESSAGE_ERROR'
    ];

    this.rabbitService.getMessage<(Omit<Product, 'id'> & { shopName: string, category3LevelName: string })[]>('products_queue')
      .pipe(
        switchMap((products: (Omit<Product, 'id'> & { shopName: string, category3LevelName: string })[]) => {
          return forkJoin([of(products), this.deleteAllProducts()])
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            )
        }),
        switchMap(([
          products,
          affectedRows
        ]: [
          (Omit<Product, 'id'> & { shopName: string, category3LevelName: string })[],
          number
        ]) => {
          Logger.warn(`Deleting products: ${affectedRows} rows`, 'ProductsService');
          return forkJoin([of(products), this.categoriesService.getAllCategories3Level()])
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            )
        }),
        switchMap(([
          products,
          categories3Level
        ]: [
          (Omit<Product, 'id'> & { shopName: string, category3LevelName: string })[],
          Category3Level[]
        ]) => {
          console.log(products.length)
          const productsForSave: (Omit<Product, 'id' | 'shop'>)[] = []

          for (const product of products) {
            const existedCategory3Level: Category3Level | undefined = categories3Level.find((item: Category3Level) => item.name === product.category3LevelName);

            if (existedCategory3Level) {
              productsForSave.push({
                name: product.name,
                description: product.description,
                imagePath: product.imagePath,
                price: product.price,
                characteristics: product.characteristics,
                category3Level: existedCategory3Level,
                users: []
              })
            }
          }

          return this.saveProducts(productsForSave)
            .pipe(
              catchError((err: Error) => {
                errorCode = errorCodes[0];
                return throwError(() => err);
              })
            );
        }),
        catchError((err: Error) => {
          errorCode = errorCodes[1];
          Logger.error(`Error code: ${errorCode}, queue: ${'products_queue'}, ${err}`, 'ProductsService');
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
  public saveProducts(products: (Omit<Product, 'id' | 'shop'>)[]): Observable<Product[]> {
    return from(this.productRepository.save(products));
  }

  /**
   * Удаление всех товаров
   * @return {*}  {Observable<number>} кол-во затронутых строк
   * @memberof ProductsService
   */
  public deleteAllProducts(): Observable<number> {
    return from(this.productRepository.delete({}))
      .pipe(
        switchMap((result: DeleteResult) => of(result.affected))
      );
  }
}
