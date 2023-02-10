/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, Shop } from '@core/entities';
import { In, Repository } from 'typeorm';
import { from, iif, Observable, of, switchMap } from 'rxjs';
import { IProductQuery, IUserFilter } from '@core/interfaces';

/**
 * Сервис магазинов
 * @export
 * @class ProductsService
 */
@Injectable()
export class ShopsService {
  /**
   * Репозиторий товаров
   * @private
   * @type {Repository<Product>}
   * @memberof ProductsService
   */
  @InjectRepository(Shop, 'postgresConnect')
  private readonly shopRepository: Repository<Shop>;

  /**
   * Получение всех товаров в определенных категориях 3 уровня
   * @param {IProductQuery} query запрос для товаров
   * @return {*}  {Observable<Product[]>}
   * @memberof ProductsService
   */
  public getAll(): Observable<Shop[]> {
    return from(this.shopRepository.find({}));
  }


  /**
   * Получение товара по id
   * @param {string} id id
   * @return {*}  {Observable<Product | null>} товар
   * @memberof ProductsService
   */
  public getById(id: string): Observable<Shop | null> {
    return from(this.shopRepository.findOne({
      where: {
        id
      },
      relations: {
        products: true
      }
    }));
  }
}
