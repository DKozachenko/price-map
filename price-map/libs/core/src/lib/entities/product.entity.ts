import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Category3Level, Shop, User } from ".";
import { ICharacteristic } from './../interfaces';

/**
 * Сущность товара
 * @export
 * @class Product
 */
@Entity({
  name: 'Products'
})
export class Product {
  /**
   * Id записи
   * @type {string}
   * @memberof Product
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Название
   * @type {string}
   * @memberof Product
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
   * @memberof Product
   */
  @Column({
    type: 'varchar',
    length: 5000,
    nullable: false
  })
  public description: string;

  /**
   * Цена
   * @type {number}
   * @memberof Product
   */
  @Column({
    type: 'int',
    nullable: false
  })
  public price: number;

  /**
   * Характеристики
   * @type {ICharacteristic[]}
   * @memberof Product
   */
  @Column({
    type: 'jsonb',
    nullable: false
  })
  public characteristics: ICharacteristic[];

  /**
   * Путь до изображения
   * @type {string}
   * @memberof Product
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public imagePath?: string;

  /**
   * Магазин, в котором он находится
   * @type {Shop}
   * @memberof Product
   */
  @ManyToOne(() => Shop, (shop: Shop) => shop.products, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  public shop: Shop;

  /**
   * Категория 3 уровня, к которой относится
   * @type {Category3Level}
   * @memberof Product
   */
  @ManyToOne(() => Category3Level, (category: Category3Level) => category.products, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  public category3Level: Category3Level;
  
  /**
   * Пользователи, у которых есть этот товар в избранном
   * @type {User[]}
   * @memberof Product
   */
  @ManyToMany(() => User, (user: User) => user.products)
  public users: User[]
}