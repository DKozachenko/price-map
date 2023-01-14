import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Product } from ".";
import { Role } from "../enums";

@Entity({
  name: 'Users'
})
export class User {
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
    length: 100,
    nullable: false
  })
  public lastName: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public role: Role;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
    unique: true
  })
  public mail: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
    unique: true
  })
  public nickname: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  public password: string;

  @ManyToMany(() => Product, (product: Product) => product.users, {
    eager: true,
    cascade: true,
  })
  @JoinTable({
    name: 'UserProducts'
  })
  public products: Product[]
}