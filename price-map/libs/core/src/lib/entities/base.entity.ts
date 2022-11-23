import { Column } from 'typeorm';

//TODO: Подумать для каких сущностей добавить
export abstract class BaseEntity {
  @Column({ 
    type: 'bigint', 
    nullable: true 
  })
  public creationTime: string;

  @Column({ 
    type: 'bigint',
    nullable: true
  })
  public updateTime: string;
}