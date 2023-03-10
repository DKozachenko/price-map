import { Product } from '.';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ICoordinates } from '../interfaces';

/**
 * Сущность магазина (филиала)
 * @export
 * @class Shop
 */
@Entity({
  name: 'Shops'
})
export class Shop {
  /**
   * Id записи
   * @type {string}
   * @memberof Shop
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Id точки в OSM
   * @type {string}
   * @memberof Shop
   */
  @Column({
    type: 'bigint',
    nullable: false
  })
  public osmNodeId: string;

  /**
   * Название
   * @type {string}
   * @memberof Shop
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  /**
   * Сайт
   * @type {string}
   * @memberof Shop
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public website?: string;

  /**
   * Координаты
   * @type {ICoordinates}
   * @memberof Shop
   */
  @Column({
    type: 'jsonb',
    nullable: false
  })
  public coordinates: ICoordinates;

  /**
   * Продукты, которые есть в этом магазине
   * @type {Product[]}
   * @memberof Shop
   */
  @OneToMany(() => Product, (product: Product) => product.shop, {
    eager: false
  })
  public products: Product[]
}