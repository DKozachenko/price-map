import { ICharacteristic } from './../../../../../../../libs/core/src/lib/interfaces/characteristic.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { Any, In, Repository } from 'typeorm';
import { from, Observable, of, switchMap } from 'rxjs';
import { IProductQuery } from '@core/interfaces';

/**
 * Сервис товаров
 * @export
 * @class ProductsService
 */
@Injectable()
export class ProductsService {
  /**
   * Репозиторий товаров
   * @private
   * @type {Repository<Product>}
   * @memberof ProductsService
   */
  @InjectRepository(Product, 'postgresConnect')
  private readonly productRepository: Repository<Product>;

  /**
   * Получение всех товаров в определенных категориях 3 уровня
   * @param {string[]} ids id категорий 3 уровня
   * @return {*}  {Observable<Product[]>} товары
   * @memberof ProductsService
   */
  public getAll(query: IProductQuery): Observable<Product[]> {
    return from(this.productRepository.find({
      where: {
        category3Level: {
          id: In(query.category3LevelIds)
        }
      },
      relations: {
        shop: true,
        category3Level: true
      }
    }))
      .pipe(
        switchMap((products: Product[]) => {
          if (query.filters && query.filters.length) {
            let result = [];

            for (const product of products) {
              const characteristics: ICharacteristic[] = product.characteristics;
              let approach = 0;

              for (const filter of query.filters) {
                const characteristic: ICharacteristic = characteristics.find((char: ICharacteristic) => char.name === filter.name);

                if (characteristic) {
                  if (filter.type === 'boolean') {
                    if (filter.value === null) {
                      ++approach;
                    }
                    if (filter.value !== null && <boolean>(characteristic.value) === <boolean>filter.value) {
                      ++approach;
                    }
                  } else if (filter.type === 'enum') {
                    if ((<(string | number)[]>filter.value).includes(<string | number>characteristic.value)) {
                      ++approach;
                    }
                  } else {
                    const leftLimit: number = filter.value[0];
                    const rightLimit: number = filter.value[1];

                    if (leftLimit && rightLimit) {
                      if (characteristic.value >= leftLimit && characteristic.value <= rightLimit) {
                        ++approach;
                      }
                    } else if (leftLimit && !rightLimit) {
                      if (characteristic.value >= leftLimit) {
                        ++approach;
                      }
                    } else if (!leftLimit && rightLimit) {
                      if (characteristic.value <= rightLimit) {
                        ++approach;
                      }
                    } else {
                      ++approach;
                    }
                  }
                }
              }

              if (approach === query.filters.length) {
                result.push(product);
              }
            }

            return of(result);
          }

          return of(products);
        })
      );
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
}
