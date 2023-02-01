import { Category2Level } from '.';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

/**
 * Сущность категории 1 уровня
 * @export
 * @class Category1Level
 */
@Entity({
  name: 'Categories1Level'
})
export class Category1Level {
  /**
   * Id записи
   * @type {string}
   * @memberof Category1Level
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Название
   * @type {string}
   * @memberof Category1Level
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;
  
  /**
   * Категории 2 уровня
   * @type {Category2Level[]}
   * @memberof Category1Level
   */
  @OneToMany(() => Category2Level, (category: Category2Level) => category.category1Level, {
    eager: true,
    cascade: true
  })
  public categories2Level: Category2Level[]
}