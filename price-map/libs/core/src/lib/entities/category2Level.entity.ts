import { Category1Level, Category3Level } from '.';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"

/**
 * Сущность категории 2 уровня
 * @export
 * @class Category2Level
 */
@Entity({
  name: 'Categories2Level'
})
export class Category2Level {
  /**
   * Id записи
   * @type {string}
   * @memberof Category2Level
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Название
   * @type {string}
   * @memberof Category2Level
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  /**
   * Категория 1 уровня, к которой она относится
   * @type {Category1Level}
   * @memberof Category2Level
   */
  @ManyToOne(() => Category1Level, (category: Category1Level) => category.categories2Level, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete'
  })
  @JoinColumn() 
  public category1Level: Category1Level;

  /**
   * Категории 3 уровня
   * @type {Category3Level[]}
   * @memberof Category2Level
   */
  @OneToMany(() => Category3Level, (category: Category3Level) => category.category2Level, {
    eager: true,
    cascade: ['insert', 'update', 'remove']
  })
  public categories3Level: Category3Level[]
}