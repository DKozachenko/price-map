import { Shop } from '.';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

/**
 * Сущность организации
 * @export
 * @class Organization
 */
@Entity({
  name: 'Organizations'
})
export class Organization {
  /**
   * Id записи
   * @type {string}
   * @memberof Organization
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Название
   * @type {string}
   * @memberof Organization
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  /**
   * Описание
   * @type {string}
   * @memberof Organization
   */
  @Column({
    type: 'varchar',
    length: 500,
    nullable: false
  })
  public description: string;

  /**
   * Путь до изображения
   * @type {string}
   * @memberof Organization
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public imagePath?: string;

  /**
   * Ссылка на веб-сайт
   * @type {string}
   * @memberof Organization
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public website?: string;

  /**
   * Магазины (филиалы) этой организации
   * @type {Shop[]}
   * @memberof Organization
   */
  @OneToMany(() => Shop, (shop: Shop) => shop.organization, {
    eager: true,
    cascade: true,
  })
  public shops: Shop[]
}