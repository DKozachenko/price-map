import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Category3Level, Shop, User } from ".";
import { ICharacteristic } from './../interfaces';

@Entity({
  name: 'Products'
})
export class Product {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: false
  })
  public description: string;

  @Column({
    type: 'jsonb',
    nullable: false
  })
  public characteristics: ICharacteristic[];

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public imagePath: string;

  @ManyToOne(() => Shop, (shop: Shop) => shop.products, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  public shop: Shop;

  @ManyToOne(() => Category3Level, (category: Category3Level) => category.products, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  public category3Level: Category3Level;

  @ManyToMany(() => User, (user: User) => user.products)
  public users: User[]
}