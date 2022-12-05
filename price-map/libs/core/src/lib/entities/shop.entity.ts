import { Organization, Product } from '.';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ICoordinates, ISchedule } from '../interfaces';

@Entity({
  name: 'Shops'
})
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

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
  public schedule: ISchedule;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true
  })
  public imagePath: string;

  @Column({
    type: 'jsonb',
    nullable: true
  })
  public coordinates: ICoordinates;

  @ManyToOne(() => Organization, (organization: Organization) => organization.shops, {
    orphanedRowAction: 'delete'
  })
  @JoinColumn()
  public organization: Organization

  @OneToMany(() => Product, (product: Product) => product.shop, {
    eager: true,
    cascade: true,
  })
  public products: Product[]
}