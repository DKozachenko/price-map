import { Column } from 'typeorm';

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