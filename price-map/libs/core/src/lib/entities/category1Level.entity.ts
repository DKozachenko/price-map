import { Category2Level } from '.';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity({
  name: 'Categories1Level'
})
export class Category1Level {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  //TODO: Возможно убрать лишнюю подгрузку через eager
  @OneToMany(() => Category2Level, (category: Category2Level) => category.category1Level, {
    eager: true,
    cascade: true
  })
  public categories2Level: Category2Level[]
}