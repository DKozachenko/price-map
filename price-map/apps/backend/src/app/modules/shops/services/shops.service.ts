/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from '@core/entities';
import { Repository } from 'typeorm';
import { from, Observable} from 'rxjs';

/**
 * Сервис магазинов
 * @export
 * @class ProductsService
 */
@Injectable()
export class ShopsService {
  /**
   * Репозиторий магазинов
   * @private
   * @type {Repository<Shop>}
   * @memberof ShopsService
   */
  @InjectRepository(Shop, 'postgresConnect')
  private readonly shopRepository: Repository<Shop>;

  /**
   * Получение всех магазинов
   * @return {*}  {Observable<Shop[]>} магазины
   * @memberof ShopsService
   */
  public getAll(): Observable<Shop[]> {
    return from(this.shopRepository.find({
      relations: {
        products: true
      }
    }));
  }

  /**
   * Получение магазина по id
   * @param {string} id id
   * @return {*}  {(Observable<Shop | null>)} магазин
   * @memberof ShopsService
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
