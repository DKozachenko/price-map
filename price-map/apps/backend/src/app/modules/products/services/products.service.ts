import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { Any, In, Repository } from 'typeorm';
import { from, Observable } from 'rxjs';

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
  public getAll(ids: string[]): Observable<Product[]> {
    return from(this.productRepository.find({
      where: {
        category3Level: {
          id: In(ids)
        }
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
}
