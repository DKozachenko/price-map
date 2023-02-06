import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Category2Level, Product } from ".";
import { IFilter } from "../interfaces";

/**
 * Сущность категории 3 уровня
 * @export
 * @class Category3Level
 */
@Entity({
  name: 'Categories3Level'
})
export class Category3Level {
  /**
   * Id записи
   * @type {string}
   * @memberof Category3Level
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Название
   * @type {string}
   * @memberof Category3Level
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  /**
   * Фильтры
   * @type {IFilter[]}
   * @memberof Category3Level
   */
  @Column({
    type: 'jsonb',
    nullable: false
  })
  public filters: IFilter[];

  /**
   * Категория 2 уровня, к которой она относится
   * @type {Category2Level}
   * @memberof Category3Level
   */
  @ManyToOne(() => Category2Level, (category: Category2Level) => category.categories3Level, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn() 
  public category2Level: Category2Level;

  /**
   * Товары, которые относятся к этой категории
   * @type {Product[]}
   * @memberof Category3Level
   */
  @OneToMany(() => Product, (product: Product) => product.category3Level, {
    eager: false,
    cascade: true,
  })
  public products: Product[]
}