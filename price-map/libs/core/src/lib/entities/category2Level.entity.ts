import { Category1Level, Category3Level } from '.';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity({
  name: 'Categories2Level'
})
export class Category2Level {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  @ManyToOne(() => Category1Level, (category: Category1Level) => category.categories2Level, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn() 
  public category1Level: Category1Level;

  @OneToMany(() => Category3Level, (category: Category3Level) => category.category2Level, {
    eager: true,
    cascade: true,
  })
  public categories3Level: Category3Level[]
}