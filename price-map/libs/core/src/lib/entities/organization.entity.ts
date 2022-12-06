import { Shop } from '.';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"

@Entity({
  name: 'Organizations'
})
export class Organization {
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
    type: 'varchar',
    length: 200,
    nullable: false
  })
  public imagePath: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public website: string;

  @OneToMany(() => Shop, (shop: Shop) => shop.organization, {
    eager: true,
    cascade: true,
  })
  public shops: Shop[]
}