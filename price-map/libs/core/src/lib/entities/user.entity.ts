import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Product } from ".";
import { Role } from "../enums";

/**
 * Сущность пользователя
 * @export
 * @class User
 */
@Entity({
  name: 'Users'
})
export class User {
  /**
   * Id записи
   * @type {string}
   * @memberof User
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Имя
   * @type {string}
   * @memberof User
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public name: string;

  /**
   * Фамилия
   * @type {string}
   * @memberof User
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public lastName: string;

  /**
   * Роль
   * @type {Role}
   * @memberof User
   */
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  public role: Role;

  /**
   * Почта
   * @type {string}
   * @memberof User
   */
  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
    unique: true
  })
  public mail: string;

  /**
   * Никнейм
   * @type {string}
   * @memberof User
   */
  @Column({
    type: 'varchar',
    length: 150,
    nullable: false,
    unique: true
  })
  public nickname: string;

  /**
   * Пароль
   * @type {string}
   * @memberof User
   */
  @Column({
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  public password: string;

  /**
   * Товары, которые находятся в избранном
   * @type {Product[]}
   * @memberof User
   */
  @ManyToMany(() => Product, (product: Product) => product.users, {
    eager: true,
    cascade: true,
  })
  @JoinTable({
    name: 'UserProducts'
  })
  public products: Product[]
}