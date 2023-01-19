import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category3Level, Category1Level } from '@core/entities';
import { Repository } from 'typeorm';

@Injectable()
export class Categories1LevelService {
  @InjectRepository(Category1Level, 'postgresConnect')
  private readonly category1LevelRepository: Repository<Category1Level>;

  @InjectRepository(Category3Level, 'postgresConnect')
  private readonly category3LevelRepository: Repository<Category3Level>;

  async getAll(): Promise<Category1Level[]> {
    return this.category1LevelRepository.find({
      relations: {
        categories2Level: true,
      }
    });
  }

  async getById(id: string): Promise<Category3Level> {
    return this.category3LevelRepository.findOne({
      where: {
        id
      }
    });
  }
}
