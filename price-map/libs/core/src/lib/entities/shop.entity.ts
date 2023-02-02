import { Organization, Product } from '.';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ICoordinates, ISchedule } from '../interfaces';

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
   * Расписание
   * @type {ISchedule}
   * @memberof Shop
   */
  @Column({
    type: 'jsonb',
    nullable: false
  })
  public schedule: ISchedule;

  /**
   * Путь до изображения
   * @type {string}
   * @memberof Shop
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public imagePath?: string;

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
   * Организация, к которой он относится
   * @type {Organization}
   * @memberof Shop
   */
  @ManyToOne(() => Organization, (organization: Organization) => organization.shops, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  public organization: Organization

  /**
   * Продукты, которые есть в этом магазине
   * @type {Product[]}
   * @memberof Shop
   */
  @OneToMany(() => Product, (product: Product) => product.shop, {
    eager: true,
    cascade: true,
  })
  public products: Product[]
}