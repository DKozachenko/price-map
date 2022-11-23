import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Category2Level, Product } from ".";

@Entity({
  name: 'Categories3Level'
})
export class Category3Level {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  @Column({
    type: 'jsonb',
    nullable: false
  })
  public filters: string;

  @ManyToOne(() => Category2Level, (category: Category2Level) => category.categories3Level, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn() 
  public category2Level: Category2Level;

  @OneToMany(() => Product, (product: Product) => product.category3Level, {
    eager: true,
    cascade: true,
  })
  public products: Product[]
}