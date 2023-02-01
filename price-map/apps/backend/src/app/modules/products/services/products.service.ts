import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '@core/entities';
import { Any, In, Repository } from 'typeorm';

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
   * @return {*}  {Promise<Product[]>} товары
   * @memberof ProductsService
   */
  public async getAll(ids: string[]): Promise<Product[]> {
    return await this.productRepository.find({
      where: {
        category3Level: {
          id: In(ids)
        }
      },
      relations: {
        shop: true,
        category3Level: true
      }
    });
  }

  /**
   * Получение товара по id
   * @param {string} id id
   * @return {*}  {Promise<Product>} товар
   * @memberof ProductsService
   */
  public async getById(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: {
        id
      },
      relations: {
        shop: true,
        category3Level: true
      }
    });
  }
}
