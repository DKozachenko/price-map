/* eslint-disable no-case-declarations */
/* eslint-disable indent */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from '@core/entities';
import { DeleteResult, In, Repository } from 'typeorm';
import { from, Observable, of, switchMap} from 'rxjs';

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

  /**
   * Сохранение магазинов
   * @param {Shop[]} shops магазины
   * @return {*}  {Observable<Shop[]>} сохраненые в БД записи
   * @memberof ShopsService
   */
  public saveAll(shops: Shop[]): Observable<Shop[]> {
    return from(this.shopRepository.save(shops));
  }

  /**
   * Удаление всех магазинов
   * @return {*}  {Observable<number>} кол-во затронутых строк
   * @memberof ShopsService
   */
  public deleteAll(): Observable<number> {
    return from(this.shopRepository.delete({}))
      .pipe(
        switchMap((result: DeleteResult) => of(result.affected))
      );
  }

  /**
   * Получение магазинов по id
   * @param {string[]} ids массив id
   * @return {*}  {Observable<Shop[]>} товары
   * @memberof ShopsService
   */
  public getByIds(ids: string[]): Observable<Shop[]> {
    return from(this.shopRepository.find({
      where: {
        id: In(ids)
      },
      relations: {
        products: true
      }
    }));
  }
}
